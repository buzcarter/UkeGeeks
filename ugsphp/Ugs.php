<?php

/**
 * a "lite" MVC-ish Controller
 * @class Ugs
 * @namespace ugsPhp
 */
class Ugs{

	/**
	 * Boostraps and runs the entire danged system!
	 */
	public static function Init() {
		self::Bootstrap();

		// Reads query param to pick appropriate Actions
		$action = isset($_GET['action']) ? Actions::ToEnum($_GET['action']) : Actions::SongList;

		if (Config::IsLoginRequired){
			if (!self::DoAuthenticate($action)){
				return;
			}
		}

		$builder = self::GetBuilder($action);
		$model = $builder->Build();

		// all done, time to render
		self::RenderView($model, $action);
	}

	/**
	 * Renders View associated with Action, making only $model available on the page
	 * @param [ViewModel] $model  appropriate view model entity
	 * @param [Actions(int)] $action
	 */
	private static function RenderView($model, $action){
		header('X-Powered-By: ' . Config::PoweredBy);
		include_once(Config::$ViewsPath . self::GetViewName($action));
	}

	/**
	 * returns TRUE if normal processing should continue, FALSE otherwise,
	 * either by hijacking the page by performing a recirect
	 * or by rendering an alternate view
	 */
	private static function DoAuthenticate($action){
		$login = new SimpleLogin;

		if ($action == Actions::Logout){
			$login->Logout();
			header('Location: ' . self::MakeUri(Actions::Login));
			return  false;
		}
		elseif (!$login->IsLoggedIn) {
			$builder = self::GetBuilder(Actions::Login);
			$model = $builder->Build($login);

			// during form post the builder automatically attempts a login -- let's check whether that succeeded...
			if (!$login->IsLoggedIn) {
				self::RenderView($model, Actions::Login);
				return  false;
			}

			// successful login we redirect:
			header('Location: ' . self::MakeUri(Actions::SongList));
			return  false;
		}
		elseif ($action == Actions::Login){
			// if for some reason visitor is already logged in but attempting to view the Login page, redirect:
			header('Location: ' . self::MakeUri(Actions::SongList));
			return false;
		}

		return true;
	}

	/**
	 * Returns instance of appropriate Builder class
	 * @param ActionEnum $action desired action
	 * @return ViewModelBuilder-Object (Instantiated class)
	 */
	private static function GetBuilder($action) {
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
			default:
				$builder = Config::UseDetailedLists
					? new SongListDetailed_Vmb()
					: new SongList_Vmb();
				break;
		}

		return $builder;
	}

	/**
	 * Bootstraps UGS...
	 * > Instantiates configs class
	 * > Automatically includes ALL of the PHP classes in these directories: "classes" and "viewmodels".
	 * This is a naive approach, see not about including base classes first.
	 * @private
	 */
	private static function Bootstrap() {
		// let's get Config setup
		$appRoot = dirname(__FILE__);
		include_once($appRoot . '/Config.php');
		// make sure the base class is indlucded first...
		include_once($appRoot . '/viewmodels/_base_Vm.php');

		Config::Init();

		foreach (array('classes', 'viewmodels', 'builders') as $directory) {
			foreach (glob($appRoot . '/' . $directory . '/*.php') as $filename) {
				include_once $filename;
			}
		}

	}

	/**
	 * builds (relative) URL
	 * @param Actions(enum) $action [description]
	 * @param string $param  extra query param value (right now only "song")
	 * @return  string
	 */
	public static function MakeUri($action, $param = ''){
		$actionName = Actions::ToName($action);
		$param = trim($param);

		if (!Config::UseModRewrite){
			$actionParams = strlen($param) > 0 ? '&song=' . $param : '';
			return '/music.php?action=' . $actionName . $actionParams;
		}

		if (($action == Actions::Song) || ($action == Actions::SongList)) {
			$actionName = 'songbook';
		}
		return '/' . strtolower($actionName) . '/' . $param;
	}

	/**
	 * Gets the PHP filename (aka "View") to be rendered
	 * @param Actions(int-enum) $action
	 * @return  string
	 */
	private static function GetViewName($action){
		switch($action){
			case Actions::Song: return Config::UseEditableSong ? 'song-editable.php' : 'song.php';
			case Actions::Edit: return 'song-editable.php';
			case Actions::Source: return 'song-source.php';
			case Actions::Reindex: return 'songs-rebuild-cache.php';
			case Actions::Logout:
			case Actions::Login:
				return 'login.php';
		}
		return Config::UseDetailedLists ? 'song-list-detailed.php' : 'song-list.php';
	}

}