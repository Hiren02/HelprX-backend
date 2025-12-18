const { Wallet, Transaction, Worker } = require('../../database/models');
const { TRANSACTION_TYPES, PAYOUT_STATUS } = require('../../common/constants');

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
    const wallet = await this.getOrCreateWallet(workerId);

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
}

module.exports = new WalletService();
