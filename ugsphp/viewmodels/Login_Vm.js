const BaseViewModel = require('./_base_Vm');

class Login_Vm extends BaseViewModel {
  ErrorMessage = '';

  Username = '';

  FormPostUri = '';

  constructor() {
    parent.__construct();
    $this.FormPostUri = Ugs.MakeUri(Actions.Login);
  }
}
