<?php

/**
 * Shared file access methods
 */
class FileHelper {
	/**
	 * Parses URL looks for song query string param value. Always returns a bare
	 * filename (no directories) ending in Config::FileExtension, or the 404 filename.
	 * @return string
	 */
	public static function getFilename() {
		$s = isset( $_GET['song'] ) && is_string( $_GET['song'] ) ? $_GET['song'] : '';
		$s = self::ToSongFilename( $s );
		return ( $s === null ) ? Config::NotFound_404File : $s;
	}

	/**
	 * Normalizes a song id ("name", "name.cpm.txt", "name.html") to a bare song filename.
	 * Returns null if the value is empty or contains path characters.
	 *
	 * @param string $value
	 * @return string|null
	 */
	public static function ToSongFilename( $value ) {
		$value = trim( (string) $value );
		if ( ( strlen( $value ) < 1 ) || ( strlen( $value ) > 255 ) || strpbrk( $value, "/\\\0" ) !== false || ( $value[0] === '.' ) ) {
			return null;
		}
		if ( preg_match( Config::FileNamePattern, $value ) !== 1 ) {
			$value = preg_replace( '/\.html?$/i', '', $value ) . Config::FileExtension;
		}
		return $value;
	}

	/**
	 * Returns the absolute path of an EXISTING song file inside the song directory,
	 * or null. Guards against path traversal: the resolved real path must live
	 * directly in Config::$SongDirectory.
	 *
	 * @param string $filename
	 * @return string|null
	 */
	public static function getSongPath( $filename ) {
		$filename = self::ToSongFilename( $filename );
		if ( $filename === null ) {
			return null;
		}
		$songDir = realpath( Config::$SongDirectory );
		$path = realpath( Config::$SongDirectory . $filename );
		if ( ( $songDir === false ) || ( $path === false ) || !is_file( $path ) ) {
			return null;
		}
		return ( dirname( $path ) === $songDir ) ? $path : null;
	}

	/**
	 * Reads a song file by filename (see getSongPath). Returns null if not found.
	 * @param string $filename
	 * @return string|null
	 */
	public static function getSongFile( $filename ) {
		$path = self::getSongPath( $filename );
		return ( $path === null ) ? null : self::getFile( $path );
	}

	/**
	 * tries to open and read the requested file. Only call with trusted paths!
	 * @param string $fname
	 * @return string|null
	 */
	public static function getFile( $fname ) {
		if ( !is_file( $fname ) || !is_readable( $fname ) ) {
			return null;
		}
		$data = file_get_contents( $fname, false, null, 0, Config::MaxFileSize );
		return ( $data === false ) ? null : $data;
	}

	/**
	 * Lists song filenames (matching Config::FileNamePattern) in a directory, sorted.
	 * @param string $dir
	 * @return array
	 */
	public static function getFilenames( $dir ) {
		if ( !is_dir( $dir ) ) {
			error_log( 'UkeGeeks: failed to open song directory -> ' . $dir );
			return array();
		}

		$f = array();
		foreach ( scandir( $dir ) as $file ) {
			if ( is_file( $dir . $file ) && ( preg_match( Config::FileNamePattern, $file ) === 1 ) ) {
				$f[] = $file;
			}
		}
		sort( $f, SORT_STRING );
		return $f;
	}

}
