'use strict';

/**
 * hour service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::hour.hour');
