<?php 

/**
 * Shared file access methods
 */
class FileHelper {
	/**
	 * Parses URL looks for song query string param value
	 * @return string 
	 */
	public static function getFilename() {
		$s = (isset($_GET['song'])) ? $_GET['song'] : '';
		if (strlen($s) < 1){
			return Config::NotFound_404File;
		}
		if (strpos($s, '.txt') || strpos($s, '.cpm')){
			return $s;
		}
		$pattern = '/(.*[\/])?(.*?)(\.html?)?$/';
		$s = preg_replace($pattern, '$2', $s) . Config::FileExtension;
		return $s;
	}

	/**
	 * tries to open and read the requested file
	 * @param string $fname
	 * @return string 
	 */
	public static function getFile($fname) {
		$data = '';
		if (!file_exists($fname)) {
			return null;
			// die($errPrefix." &quot;".$fname."&quot; not found.");
		}
		$fh = fopen($fname, 'r');
		$data = fread($fh, Config::MaxFileSize);
		fclose($fh);
		return $data;
	}

}