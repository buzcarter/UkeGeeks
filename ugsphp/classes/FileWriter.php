<?php
class NewSong_Vm {
	public $IsHttpPost = false;
	public $HasErrors = false;
	public $Title = '';
	public $Artist = '';
	public $Message = '';
	public $Filename = '';
}

class FileWriter {
	// const FILE_DIRECTORY = 'cpm/';

	const ID_PREFIX = '.ugs';

	const MAX_TITLE_LENGTH = 40;
	const MAX_ARTIST_NAME = 25;

	private static $allowedCharsRegEx = '/[^a-z_\-0-9]/';
	private static $dupeSpacersRegEx = '/(_|-)+/';

	/**
	 * using supplied info keeps testing for a unique file name by appending random-ish string to
	 * filename created using base name
	 *
	 * @param string  $directory    where the file should live
	 * @param string  $baseFilename this does not need to be unique, but is ideally descriptive
	 * @param string  $extenstion   (optional) file's extension, please include the dot!
	 * @return string final file name
	 */
	private function UniqueFilename( $directory, $baseFilename, $extenstion = '.txt' ) {
		$filename = '';
		while ( true ) {
			$m = microtime();
			$filename = $baseFilename . self::ID_PREFIX . ( ( $m - floor( $m ) ) * 1000000 ) . $extenstion;
			if ( !file_exists( $directory . $baseFilename ) ) {
				break;
			}
		}

		return $filename;
	}

	/**
	 * returns a OS-safe suitable filename from supplied value
	 *
	 * @param [string] $value     [description]
	 * @param integer $maxLength (optional) maximum lenght (might be off by two characters as trimming leading _ happens last)
	 * @return string
	 */
	public function ScrubForFilename( $value, $maxLength = 35 ) {
		$value = str_replace( '\'', '', trim( strtolower( $value ) ) );
		if ( strlen( $value ) < 1 ) {
			return '';
		}

		$value = preg_replace( self::$dupeSpacersRegEx, '_', preg_replace( self::$allowedCharsRegEx, '_', $value ) );
		$value = substr( $value, 0, $maxLength );

		return preg_replace( '/^_/', '', preg_replace( '/_$/', '', $value ) );
	}

	/**
	 * Generates a unique filename (within a given directory)
	 *
	 * @param [string] $title  [description]
	 * @param [string] $artist [description]
	 * @return string [description]
	 */
	public function MakeFile( $title, $artist ) {
		$f = $this->ScrubForFilename( $title, self::MAX_TITLE_LENGTH );
		if ( strlen( $f ) < 1 ) {
			$f = 'untitled';
		}

		$a = $this->ScrubForFilename( $artist, self::MAX_ARTIST_NAME );
		if ( strlen( $a ) > 0 ) {
			$f .= '.' . $a;
		}

		$filename = $this->UniqueFilename( Config::$SongDirectory, $f, Config::FileExtension );

		$content = $this->MakeChordProStub( $title, $artist );
		$filesize = file_put_contents( Config::$SongDirectory . $filename, $content );

		return ( $filesize > 0 ) ? $filename : '';

	}

	/**
	 * returns skeleton ChordPro (text) file using supplied Title, Artist, etc
	 *
	 * @param [string] $title  song title
	 * @param [string] $artist song's artist (optional)
	 * @return string [description]
	 */
	private function MakeChordProStub( $title = '', $artist = '' ) {
		$title = trim( $title );
		$artist = trim( $artist );

		$content = '{title: ' . ( strlen( $title ) > 0 ? $title : 'untitled' ) . "}\n";
		$content .= '{artist: ' . ( strlen( $artist ) > 0 ? $artist : 'traditional' ) . "}\n";

		return $content .
			'
TYPE_YOUR_SONG_HERE
';
	}

}
