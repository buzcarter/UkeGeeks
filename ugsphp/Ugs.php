<?php

/**
 * a "lite" MVC-ish Controller
 *
 * @class Ugs
 * @namespace ugsPhp
 */
class Ugs{

	/**
	 * Boostraps and runs the entire danged system!
	 */
	function __construct() {
		$this->Bootstrap();

		// Reads query param to pick appropriate Actions
		$action = isset( $_GET['action'] ) ? Actions::ToEnum( $_GET['action'] ) : Actions::Songbook;

		$user = $this->DoAuthenticate( $action );
		if ( !$user->IsAllowAccess  ) {
				return;
			}

    // Set user language if needed
    Lang::Init($user->Language);

    // Special action : sending the language json
    if($action == Actions::GetLangData)
    {
      Lang::SendJsonData();
      exit;
    }

		$builder = $this->GetBuilder( $action, $user );
		$model = $builder->Build();

		// all done, time to render
		if ( $model->IsJson ) {
			$this->RenderJson( $model );
		}
		else {
			$model->SiteUser = $user;
			$this->RenderView( $model, $action );
		}
	}

	/**
	 * Renders View associated with Action, making only $model available on the page
	 *
	 * @param [ViewModel] $model  appropriate view model entity
	 * @param [Actions(int)] $action
	 */
	private function RenderView( $model, $action ) {
		header('X-Powered-By: ' . Config::PoweredBy);
		include_once Config::$AppDirectory . 'views/' . $this->GetViewName( $action );
	}


	/**
	 * Emits serilized JSON version of the $model with appropriate headers
	 *
	 * @param unknown $model
	 */
	private function RenderJson( $model ) {
		header( 'Content-Type: application/json' );
		if ( isset( $model->HasErrors ) && $model->HasErrors ) {
			header( 'HTTP/1.1 500' );
		}
		unset($model->IsJson);
		echo json_encode( $model );
	}

	/**
	 * returns initialized SiteUser object, check the "Is Allow Access" property.
	 * This method MAY hijack flow controlby performing a recirect
	 * or by rendering an alternate view
	 *
	 * @param Actions(enum) $action
	 * @return SiteUser
	 */
	private function DoAuthenticate( $action ) {

		if (! Config::IsLoginRequired ) {
			$user = new SiteUser();
			$user->IsAllowAccess = true;
			return  $user;
		}

		$login = new SimpleLogin();

		if ($action == Actions::Logout){
			$login->Logout();
			header('Location: ' . self::MakeUri(Actions::Login));
			return  $login->GetUser();
		}

		$user = $login->GetUser();
		if ( !$user->IsAllowAccess ) {
			$builder = $this->GetBuilder( Actions::Login, $user );
			$model = $builder->Build($login);
			$user = $login->GetUser();

			// during form post the builder automatically attempts a login -- let's check whether that succeeded...
			if ( !$user->IsAllowAccess ) {
				$this->RenderView( $model, Actions::Login );
				return  $user;
			}

			// successful login we redirect:
			header( 'Location: ' . self::MakeUri( Actions::Songbook ) );
			return  $user;
		}
		elseif ($action == Actions::Login){
			// if for some reason visitor is already logged in but attempting to view the Login page, redirect:
			header( 'Location: ' . self::MakeUri( Actions::Songbook ) );
			return $user;
		}

		// $user->IsAllowAccess = true;
		return $user;
	}

	/**
	 * Returns instance of appropriate Builder class
	 *
	 * @param ActionEnum $action desired action
	 * @param SiteUser $siteUser current visitor
	 * @return ViewModelBuilder-Object (Instantiated class)
	 */
	private function GetBuilder( $action, $siteUser ) {
		$builder = null;

		switch($action){
      case Actions::Edit:
      case Actions::Song:
        $builder = new Song_Vmb();
        break;
      case Actions::Source:
        $builder = new Source_Vmb();
        break;
      case Actions::Reindex:
        $builder = new RebuildSongCache_Vmb();
        break;
      case Actions::Logout:
      case Actions::Login:
        $builder = new Login_Vmb();
        break;
      case Actions::AjaxNewSong:
        $builder = new Ajax_NewSong_Vmb();
        break;
      case Actions::AjaxUpdateSong:
        $builder = new Ajax_UpdateSong_Vmb();
        break;
      case Actions::AjaxDeleteSong:
        $builder = new Ajax_DeleteSong_Vmb();
        break;
      default:
        $builder = new SongListDetailed_Vmb();
        break;
		}

		$builder->SiteUser = $siteUser;
		return $builder;
	}

	/**
	 * Bootstraps UGS...
	 * > Instantiates configs class
	 * > Automatically includes ALL of the PHP classes in these directories: "classes" and "viewmodels".
	 * This is a naive approach, see not about including base classes first.
	 *
	 * @private
	 */
	private function Bootstrap() {
		// let's get Config setup
		$appRoot = dirname(__FILE__);
    if(!file_exists($appRoot.'/Config.php'))
    {
      die ('FATAL ERROR : Please create the "config.php" file from the example one. Or read the installation doc :)');
    }
    else
    {
      include_once $appRoot . '/Config.php';
    }

		// some dependencies: make sure base classes are included first...
		include_once $appRoot . '/classes/SiteUser.php';
		include_once $appRoot . '/viewmodels/_base_Vm.php';
		include_once $appRoot . '/builders/_base_Vmb.php';

		Config::Init();

		foreach (array('classes', 'viewmodels', 'builders') as $directory) {
			foreach (glob($appRoot . '/' . $directory . '/*.php') as $filename) {
				include_once $filename;
			}
		}

    Lang::Init(Config::Lang);
	}

	/**
	 * builds (relative) URL
	 *
	 * @param Actions(enum) $action [description]
	 * @param string  $param  (optional) extra query param value (right now only "song")
	 * @return  string
	 */
	public static function MakeUri($action, $param = ''){
		$directory = defined('Config::Subdirectory') ? Config::Subdirectory : '/';
		$actionName = Actions::ToName($action);
		$param = trim($param);

		if (!Config::UseModRewrite){
			$actionParams = strlen($param) > 0 ? '&song=' . $param : '';
			return $directory . 'music.php?action=' . $actionName . $actionParams;
		}

		if ($action == Actions::Song ) {
			$actionName = 'songbook';
		}
		return $directory . strtolower($actionName) . '/' . $param;
	}

	/**
	 * The rather quirky way to interface with jQuery.ajax with serialize,
	 * returns a PHP Object version of the posted JSON.
	 *
	 * @return Object
	 */
	public static function GetJsonObject(){
		$input = @file_get_contents('php://input');
		$response = json_decode($input);
		return $response;
	}

	/**
	 * Gets the PHP filename (aka "View") to be rendered
	 *
	 * @param Actions(int-enum) $action
	 * @return  string
	 */
	private function GetViewName( $action ) {
		switch($action){
			case Actions::Song: 'song-editable.php';
			case Actions::Edit: return 'song-editable.php';
			case Actions::Source: return 'song-source.php';
			case Actions::Reindex: return 'songs-rebuild-cache.php';
			case Actions::Logout:
			case Actions::Login:
				return 'login.php';
		}
		return 'song-list-detailed.php';
	}

}
