const BaseViewModel = require('./_base_Vm');

class SongViewModel extends BaseViewModel {
  Album = '';

  Artist = '';

  Body = '';

  EditorSettingsJson = '';

  EditUri = '';

  Id = '';

  SongTitle = '';

  SourceUri = '';

  Subtitle = '';

  UgsMeta = null;

  /**
   * URL where "New Song" AJAX is sent.
   * -- Only used if Editing is enabled and user has permission.
   * @var string
   */
  UpdateAjaxUri = '';

  /**
   * If TRUE View may show edit form
   * -- Only used if Editing is enabled and user has permission.
   * @var boolean
   */
  IsUpdateAllowed = false;

  constructor() {
    super();
    this.UpdateAjaxUri = '';
    // $this.UpdateAjaxUri = Ugs.MakeUri( Actions.AjaxUpdateSong);
  }
}

module.exports = SongViewModel;
