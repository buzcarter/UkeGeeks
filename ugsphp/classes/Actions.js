/**
 * Enum for possible Actions (url to ViewModel mappings)
 * @class Actions
 * @namespace ugsPhp
 */
const Actions = Object.freeze({
  Song: 0,
  Songbook: 1,
  Source: 2,
  Reindex: 3,
  Login: 4,
  Logout: 5,
  Edit: 6,
  // AJAX Actions
  AjaxNewSong: 7,
  AjaxUpdateSong: 8,

  /**
   * convert passed in string value to corresponding Actions enum
   * @param {string} value
   * @return  {Actions}
   */
  ToEnum(value) {
    const hashMap = {
      song: this.Song,
      reindex: this.Reindex,
      source: this.Source,
      edit: this.Edit,
      login: this.Login,
      logout: this.Logout,
      ajaxnewsong: this.AjaxNewSong,
      ajaxupdatesong: this.AjaxUpdateSong,
    };

    return hashMap[value.toLowerCase()] || this.Songbook;
  },

  /**
   * Converts Actions enum to a string; you should use this for URI's
   * @param {Actions} value
   * @return {string}
   */
  ToName(value) {
    const hashMap = {
      [this.Song]: 'Song',
      [this.Source]: 'Source',
      [this.Edit]: 'edit',
      [this.Reindex]: 'Reindex',
      [this.Login]: 'Login',
      [this.Logout]: 'Logout',
      [this.AjaxNewSong]: 'AjaxNewSong',
      [this.AjaxUpdateSong]: 'AjaxUpdateSong',
    };

    return hashMap[value] || 'Songbook';
  },
});

module.exports = Actions;
