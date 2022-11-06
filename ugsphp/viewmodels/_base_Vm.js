const serverConfig = require('../configs/server.json');

/**
 * base class for all View Models with visible Views (as opposed to AJAX etc)
 * @class _base_Vm
 */
class BaseViewModel {
  constructor() {
    this.StaticsPrefix = serverConfig.StaticsPrefix || '/';
  }

  PoweredBy = serverConfig.PoweredBy;

  PageTitle = '';

  SupportEmail = serverConfig.SupportEmail;

  IsJson = false;

  SiteUser = null;

  StaticsPrefix = '/';
}

module.exports = BaseViewModel;
