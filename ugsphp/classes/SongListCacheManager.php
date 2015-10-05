<?php

/**
 * Builds the SongList array, either reading from or writint to the SimpleCache.
 * @class SongListCacheManager
 */
class SongListCacheManager {

	private $cache;

	// -----------------------------------------
	// PUBLIC METHODS
	// -----------------------------------------
	function SongListCacheManager(){
		$this->cache = new SimpleCache();
		$this->cache->setCacheDir(Config::$AppDirectory . 'cache/');
	}

	/**
	 * Rebuilds the cache file by reading & parsing all ChordPro song files.
	 * @return array song list
	 */
	public function Rebuild() {
		// large song collections (1,000's of songs) might timeout, set max number of seconds for this task
		set_time_limit(45);
		$files = FileHelper::getFilenames(Config::$SongDirectory);
		$songList = $this->buildFileList($files);

		$this->cache->put(Config::SongCacheKey_FileName, serialize($songList));

		return $songList;
	}

	/**
	 * returns the song list -- tries to fetch from cache, if that fails, rebuilds
	 */
	public function Get(){
		if (!$this->cache->exists(Config::SongCacheKey_FileName)){
			return $this->Rebuild();
		}

		$cachedSongList = $this->cache->get(Config::SongCacheKey_FileName);
		return unserialize($cachedSongList);
	}

	// -----------------------------------------
	// PRIVATE METHODS
	// -----------------------------------------

	/**
	 * Emits list of links to all songs in the directory.
	 * @method buildFileList
	 * @return (song array)
	 */
	private function buildFileList($files) {

		$list = new SongListPlus_Pvm();

		foreach ($files as $fname) {
			$s = preg_replace(Config::FileNamePattern, '$1', $fname);
			$s = urlencode($s);

			$content = FileHelper::getFile(Config::$SongDirectory . $fname);
			$parsed = SongHelper::parseSong($content);

			$song = new SongLinkPlus_Pvm();
			$song->Uri = Ugs::MakeUri(Actions::Song, $s);
			$song->HasInfo = (strlen($parsed->title) + strlen($parsed->artist)) > 0;
			$song->Title = $this->fixLeadingArticle((strlen($parsed->title) > 0) ? $parsed->title : $this->filenameToTitle($s));
			$song->Subtitle = $parsed->subtitle;
			$song->Album = $parsed->album;
			$song->Artist = $parsed->artist;

			$list->SongList[] = $song;
		}
		return $list->Sort();
	}

	/**
	 * convert a filename to a pseudo-title
	 * @method filenameToTitle
	 * @param string $filename
	 * @return string
	 */
	private function filenameToTitle($filename) {
		return trim(ucwords(str_replace('-', ' ', str_replace('_', ' ', $filename))));
	}

	/**
	 * Handles titles beginning with "The", "A", "An"
	 * @method fixLeadingArticle
	 * @param string $title
	 * @return string
	 */
	private function fixLeadingArticle($title) {
		$r = '/^(the|a|an) (.*)$/i';
		if (preg_match($r, $title)){
			$title = preg_replace($r, '$2, $1', $title);
		}
		return $title;
	}
}
