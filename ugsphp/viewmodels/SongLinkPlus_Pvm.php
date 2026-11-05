<?php

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
	 * Sorts the Song List based on title (ties broken by URI so no song is ever dropped)
	 * @method Sort
	 * @return (SongLinkPlus_Pvm array)
	 */
	public function Sort() {
		usort($this->SongList, function($a, $b) {
			$cmp = strcmp(SongListPlus_Pvm::Scrub($a->Title), SongListPlus_Pvm::Scrub($b->Title));
			return ($cmp !== 0) ? $cmp : strcmp($a->Uri, $b->Uri);
		});
		return $this->SongList;
	}

	/**
	 * Lowercase, punctuation collapsed to single spaces (Unicode-aware) for sorting
	 * @param string $val
	 * @return string
	 */
	public static function Scrub($val){
		return trim(preg_replace('/\s+/u', ' ', preg_replace('/[^\p{L}\p{N}]+/u', ' ', mb_strtolower($val, 'UTF-8'))));
	}

}
