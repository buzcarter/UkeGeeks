<?php
class Lang
{
  private static $_langData = null;

  public static function Init($lang)
  {
    // Fallback if necessary
    if($lang == '')
      $lang = Config::Lang;

    $file = "lang/$lang.json";

    if(!file_exists($file))
    {
      die ("FATAL ERROR : '$lang' does NOT exists. Please choose a VALID LANGUAGE in the config file (config.php) file :)");
    }
    else
    {
      self::$_langData = json_decode(file_get_contents($file), TRUE);
      if(self::$_langData === NULL)
      {
        die('Error ('.json_last_error().') decoding language file !');
      }
    }
  }

  public static function Get($str)
  {
    if(isset(self::$_langData[$str]))
      return self::$_langData[$str];
    else
      return '??translation_missing??';
  }

  public static function GetJsonData()
  {
    echo json_encode(self::$_langData);
  }
}

?>
