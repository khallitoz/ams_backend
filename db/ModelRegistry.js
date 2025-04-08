import connectDb from "./connectDb.js";

/**
 * ModelRegistry - A singleton class to manage database models across the application
 * Stores models by clientId for easy retrieval and reuse
 */
class ModelRegistry {
  constructor() {
    // Private map to store models by clientId
    this.modelStore = new Map();

    // Statistics for monitoring
    this.stats = {
      totalConnections: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Get models for a specific client
   * Creates connection and models if they don't exist
   * @param {string} clientId - The client identifier
   * @param {string} mongoUri - MongoDB connection URI
   * @returns {Object} The models for this client
   */
  async getModels(clientId, mongoUri) {
    if (!clientId) {
      throw new Error("Client ID is required to get models");
    }

    // Check if models already exist for this client
    if (this.modelStore.has(clientId)) {
      this.stats.cacheHits++;
      return this.modelStore.get(clientId);
    }

    // If not, create a new connection and models
    this.stats.cacheMisses++;
    try {
      const { models } = await connectDb(mongoUri, clientId);

      // Store models in the registry
      this.modelStore.set(clientId, models);
      this.stats.totalConnections++;

      return models;
    } catch (error) {
      console.error(`Error creating models for client ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Check if models exist for a client
   * @param {string} clientId - The client identifier
   * @returns {boolean} True if models exist
   */
  hasModels(clientId) {
    return this.modelStore.has(clientId);
  }

  /**
   * Remove models for a specific client
   * @param {string} clientId - The client identifier
   * @returns {boolean} True if models were removed
   */
  removeModels(clientId) {
    return this.modelStore.delete(clientId);
  }

  /**
   * Get statistics about the registry
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      activeConnections: this.modelStore.size,
      clientIds: Array.from(this.modelStore.keys()),
    };
  }

  /**
   * Clear all models from the registry
   */
  clear() {
    this.modelStore.clear();
    this.stats.totalConnections = 0;
  }
}

// Create and export a singleton instance
const modelRegistry = new ModelRegistry();
export default modelRegistry;
