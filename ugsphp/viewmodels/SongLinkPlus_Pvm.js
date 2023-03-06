

class SongLinkPlus_Pvm {
	public $Uri = '';
	public $Title = '';
	public $Subtitle = '';
	public $Album = '';
	public $Artist = '';
	public $HasInfo = false;
}

/**
 *
 */
class SongListPlus_Pvm {
	public $SongList = array();

	/**
	 * Sorts the Song List based on title
	 * @method Sort
	 * @return (SongLinkPlus_Pvm array)
	 */
	Sort() {

		function scrub($val){
			return trim(preg_replace('/\s+/', ' ', preg_replace('/\W/', ' ', strtolower($val))));
		}

		$tieBreaker = 0;
		$songsListRekeyed = array();
		$titlesList = array();
		$titleKey = '';

		forEach ($this.SongList as $song) {
			$titleKey = scrub($song.Title);
			if (!isset($temp[$titleKey])){
				$titleKey .= ' _' . $tieBreaker . '_ugs87!';
				$tieBreaker++;
			}
			$titlesList[] = $titleKey;
			$songsListRekeyed[$titleKey] = $song;
		}

		sort($titlesList);

		$this.SongList = array();
		forEach ($titlesList as $key) {
			$this.SongList[] = $songsListRekeyed[$key];
		}
		return $this.SongList;
	}

}
