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
	const ID_PREFIX = '.ugs';

	const MAX_TITLE_LENGTH = 40;
	const MAX_ARTIST_NAME = 25;

	private static $allowedCharsRegEx = '/[^a-z_\-0-9]/';
	private static $dupeSpacersRegEx = '/(_|-)+/';

	/**
	 * Returns a filename (base name + random id + extension) that doesn't yet exist in $directory.
	 *
	 * @param string  $directory    where the file should live
	 * @param string  $baseFilename this does not need to be unique, but is ideally descriptive
	 * @param string  $extenstion   (optional) file's extension, please include the dot!
	 * @return string final file name, empty string if none could be found
	 */
	private function UniqueFilename( $directory, $baseFilename, $extenstion = '.txt' ) {
		for ( $i = 0; $i < 20; $i++ ) {
			$filename = $baseFilename . self::ID_PREFIX . random_int( 100000, 999999 ) . $extenstion;
			if ( !file_exists( $directory . $filename ) ) {
				return $filename;
			}
		}
		return '';
	}

	/**
	 * returns a OS-safe suitable filename from supplied value
	 *
	 * @param string  $value
	 * @param integer $maxLength (optional) maximum length (might be off by two characters as trimming leading _ happens last)
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
	 * Creates a new song stub file with a unique name (within the song directory).
	 * If name is omitted uses "untitled".
	 *
	 * @param string $title
	 * @param string $artist
	 * @return string the new filename, or empty string on failure
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

		$content = $this->MakeChordProStub( $title, $artist );

		if ( !is_writable( Config::$SongDirectory ) ) {
			return '';
		}

		$filename = $this->UniqueFilename( Config::$SongDirectory, $f, Config::FileExtension );
		if ( strlen( $filename ) < 1 ) {
			return '';
		}

		// "x" mode fails if the file already exists: never overwrites another song
		$fh = @fopen( Config::$SongDirectory . $filename, 'x' );
		if ( $fh === false ) {
			return '';
		}
		$filesize = fwrite( $fh, $content );
		fclose( $fh );

		return ( $filesize > 0 ) ? $filename : '';
	}

	/**
	 * returns skeleton ChordPro (text) file using supplied Title, Artist, etc
	 *
	 * @param string $title  song title
	 * @param string $artist song's artist (optional)
	 * @return string
	 */
	private function MakeChordProStub( $title = '', $artist = '' ) {
		// braces or newlines would break the ChordPro tags
		$title = trim( preg_replace( '/[{}\r\n]+/', ' ', $title ) );
		$artist = trim( preg_replace( '/[{}\r\n]+/', ' ', $artist ) );

		$content = '{title: ' . ( strlen( $title ) > 0 ? $title : 'untitled' ) . "}\n";
		$content .= '{artist: ' . ( strlen( $artist ) > 0 ? $artist : 'traditional' ) . "}\n";

		return $content . "\nTYPE_YOUR_SONG_HERE\n";
	}

}
