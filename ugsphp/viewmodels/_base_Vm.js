const serverConfig = require('../configs/server.json');

/* eslint-disable class-methods-use-this */
/**
 * base class for all View Models with visible Views (as opposed to AJAX etc)
 * @class _base_Vm
 */
class BaseViewModel {
  #pageTitle = '';

  get PageTitle() {
    return `${this.#pageTitle} ${serverConfig.meta.PageTitleSuffix || ''}`;
  }

  set PageTitle(value) {
    this.#pageTitle = value;
  }

  IsJson = false;

  get PoweredBy() {
    return serverConfig.meta.PoweredBy || '';
  }

  SiteUser = null;

  get StaticsPrefix() {
    return serverConfig.meta.StaticsPrefix || '';
  }

  get SupportEmail() {
    return serverConfig.meta.SupportEmail || '';
  }
}

module.exports = BaseViewModel;
