const BaseViewModel = require('./_base_Vm');


class RebuildSongCache_Vm extends BaseViewModel {
	public $ElapsedTime = 0.0;
	public $SongCount = 0;

	function __construct(){
		parent::__construct();
		$this->SongbooktUri = Ugs::MakeUri(Actions::Songbook);
	}
}
