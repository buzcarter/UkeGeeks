<?php
/**
  * Down and dirty file-based cache class...
  * Yes, needs lots of work.
	* Source: http://php-html.net/tutorials/creating-a-simple-php-cache-script/
	*/
class SimpleCache
{
	private $cacheDir = 'cache';  
	private $expiryInterval = 2592000; //30*24*60*60;  

	public function setCacheDir($val) {  $this->cacheDir = $val; }  
	public function setExpiryInterval($val) {  $this->expiryInterval = $val; }  

	/**
	 *
	 */
	public function exists($key)
	{
		$filename_cache = $this->cacheDir . '/' . $key . '.cache'; //Cache filename
		$filename_info = $this->cacheDir . '/' . $key . '.info'; //Cache info

		if (!file_exists($filename_cache) || !file_exists($filename_info))
		{
			return false;
		}

		$cache_time = file_get_contents ($filename_info) + (int)$this->expiryInterval; //Last update time of the cache file
		$time = time(); //Current Time

		$expiry_time = (int)$time; //Expiry time for the cache

		return ((int)$cache_time >= (int)$expiry_time); //Compare last updated and current time
	}

	/**
	 * If anything goes wrong returns null; otherwise the contents of the cached file
	 */
	public function get($key)
	{
		$filename_cache = $this->cacheDir . '/' . $key . '.cache'; //Cache filename
		$filename_info = $this->cacheDir . '/' . $key . '.info'; //Cache info

		if (!file_exists($filename_cache) || !file_exists($filename_info))
		{
			return null;
		}

		$cache_time = file_get_contents ($filename_info) + (int)$this->expiryInterval; //Last update time of the cache file
		$expiry_time = (int)time(); //Expiry time for the cache (Current Time)

		if ((int)$cache_time >= (int)$expiry_time) //Compare last updated and current time
		{
			return file_get_contents ($filename_cache);   //Get contents from file
		}

		return null;
	}

	/**
	 *
	 */
	public function put($key, $content)
	{
		if (! file_exists($this->cacheDir)){
			mkdir($this->cacheDir);
		}


		file_put_contents ($this->cacheDir . '/' . $key . '.cache',  $content); // save the cache content
		file_put_contents ($this->cacheDir . '/' . $key . '.info', time()); // save the time of last cache update
	}

}
?>