const { Wallet, Transaction, Worker } = require('../../database/models');
const { TRANSACTION_TYPES, PAYOUT_STATUS } = require('../../common/constants');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../../config/database');

class WalletService {
  /**
   * Get or create wallet for worker
   */
  async getOrCreateWallet(workerId) {
    let wallet = await Wallet.findOne({ where: { workerId } });

    if (!wallet) {
      wallet = await Wallet.create({ workerId });
    }

    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(userId) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    const wallet = await this.getOrCreateWallet(worker.id);
    return wallet;
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId, filters = {}) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    const wallet = await this.getOrCreateWallet(worker.id);

    const { page = 1, limit = 20, type } = filters;
    const offset = (page - 1) * limit;

    const where = { walletId: wallet.id };
    if (type) {
      where.type = type;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return {
      transactions: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Credit wallet (add money)
   */
  async creditWallet(workerId, amount, jobId, description) {
    console.log(`WalletService: Crediting wallet - Worker: ${workerId}, Amount: ${amount}`);
    const wallet = await this.getOrCreateWallet(workerId);
    console.log('WalletService: Found/Created wallet:', wallet.id);

    // Create transaction
    const transaction = await Transaction.create({
      walletId: wallet.id,
      jobId,
      type: TRANSACTION_TYPES.CREDIT,
      amount,
      status: 'captured',
      description,
    });

    // Update wallet balance
    await wallet.update({
      balance: parseFloat(wallet.balance) + parseFloat(amount),
      totalEarnings: parseFloat(wallet.totalEarnings) + parseFloat(amount),
    });

    return { wallet, transaction };
  }

  /**
   * Debit wallet (withdraw money)
   */
  async debitWallet(workerId, amount, description) {
    const wallet = await this.getOrCreateWallet(workerId);

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction = await Transaction.create({
      walletId: wallet.id,
      type: TRANSACTION_TYPES.PAYOUT,
      amount,
      status: PAYOUT_STATUS.PENDING,
      description,
    });

    // Update wallet balance
    await wallet.update({
      balance: parseFloat(wallet.balance) - parseFloat(amount),
      totalWithdrawn: parseFloat(wallet.totalWithdrawn) + parseFloat(amount),
    });

    return { wallet, transaction };
  }

  /**
   * Request payout
   */
  async requestPayout(userId, amount) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    const wallet = await this.getOrCreateWallet(worker.id);

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }

    // Minimum payout amount
    const minPayout = 100;
    if (parseFloat(amount) < minPayout) {
      throw new Error(`Minimum payout amount is ₹${minPayout}`);
    }

    const result = await this.debitWallet(
      worker.id,
      amount,
      'Payout request'
    );

    return result;
  }

  /**
   * Get historical earnings for various ranges
   */
  async getHistoricalEarnings(walletId, options = {}) {
    let { range = 'week', startDate, endDate } = options;

    let start = new Date();
    let end = new Date();
    let groupBy = 'day'; // 'day' or 'month'

    if (range === 'week') {
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);
      groupBy = 'day';
    } else if (range === 'month') {
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 29);
      groupBy = 'day';
    } else if (range === 'year') {
      start.setHours(0, 0, 0, 0);
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(1);
      groupBy = 'month';
    } else if (range === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      groupBy = diffDays > 60 ? 'month' : 'day';
    } else {
      // Default to week
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);
      groupBy = 'day';
    }

    let transactions = [];
    if (walletId) {
      const dateFunc = fn('DATE_TRUNC', groupBy, col('created_at'));

      transactions = await Transaction.findAll({
        where: {
          walletId,
          type: TRANSACTION_TYPES.CREDIT,
          status: 'captured',
          created_at: {
            [Op.between]: [start, end],
          },
        },
        attributes: [
          [dateFunc, 'date'],
          [fn('SUM', col('amount')), 'earnings'],
        ],
        group: [dateFunc],
        raw: true,
      });
    }

    // Helper to get strings for filling gaps
    const toDateStr = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      if (groupBy === 'month') return `${year}-${month}`;
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const earningsMap = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      earningsMap[toDateStr(d)] = parseFloat(t.earnings);
    });

    // Fill in gaps
    const result = [];
    let current = new Date(start);
    while (current <= end) {
      const dateStr = toDateStr(current);
      result.push({
        date: dateStr,
        earnings: earningsMap[dateStr] || 0
      });

      if (groupBy === 'month') {
        current.setMonth(current.getMonth() + 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    return result;
  }
}

module.exports = new WalletService();
