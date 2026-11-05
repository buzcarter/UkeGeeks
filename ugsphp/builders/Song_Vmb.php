<?php


/**
 * View Model Builder -- Creates a "Song" View Model
 * @class Song_Vmb
 */
class Song_Vmb extends _base_Vmb {

	/**
	 * Parses file (using URL query param) and attempts to load View Model
	 * @return Song_Vm
	 */
	public function Build() {
		$filename = FileHelper::getFilename();
		$fileContent = FileHelper::getSongFile($filename);
		$song = SongHelper::parseSong($fileContent);

		// NOTE: values are stored raw; views are responsible for escaping (see h() in Ugs.php)
		$viewModel = new Song_Vm();
		$viewModel->PageTitle = $this->MakePageTitle($song, $filename);
		$viewModel->SongTitle = $song->title;
		$viewModel->Subtitle = $song->subtitle;
		$viewModel->Artist = $song->artist;
		$viewModel->Album = $song->album;
		$viewModel->Body = $song->body;
		$viewModel->UgsMeta = $song->meta;
		$viewModel->SourceUri = Ugs::MakeUri(Actions::Source, urlencode($filename));
		$viewModel->EditUri = Ugs::MakeUri(Actions::Edit, urlencode($filename));

		$viewModel->Id = $filename;
		$viewModel->IsUpdateAllowed = $song->isOK && $this->SiteUser->MayEdit && $this->SiteUser->IsAuthenticated;

		$viewModel->EditorSettingsJson = $this->getSettings();
		return $viewModel;
	}

	/**
	 * Does not validate values, but does ensure only valid JSON was provided.
	 * @method getSettings
	 * @return string
	 */
	private function getSettings() {
		$settings = FileHelper::getFile(Config::$AppDirectory . 'settings.json');
		if ($settings === null){
			return '{}';
		}

		if (!function_exists('json_decode')){
			return $settings;
		}

		$json = preg_replace("#(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|([\s\t]//.*)|(^//.*)#", '', $settings);
		if (json_decode($json)){
			return $settings;
		}

		return '{"invalidJson": "There is a problem with your settings: invalid JSON. Please check for typos."}';
	}

	/**
	 * Uses either Title(s) from Song or the file name
	 * @param string $song
	 * @param string $filename
	 * @return string
	 */
	private function MakePageTitle($song, $filename){
		$title = '';

		if ($song->isOK){
			$title = $song->title;

			if (strlen($song->artist) > 0){
				$title .= ' - '	. $song->artist;
			} else if (strlen($song->subtitle) > 0) {
				$title .= ' - ' . $song->subtitle;
			}
		}

		return ((strlen($title) > 0) ? $title : $filename) . ' ' . Config::PageTitleSuffix;
	}
}
