<?php 

include_once(Ugs::$config->ViewModelPath .'Song_Vm.php');

/**
 * View Model Builder -- Creates a "Song" View Model
 * @class Song_Vmb
 */
class Song_Vmb {

	// -----------------------------------------
	private $fname = '';
	private $song = null;

	// -----------------------------------------
	// PUBLIC METHODS
	// -----------------------------------------
	
	/**
	 * Parses file (using URL query param) and attempts to load View Model
	 * @return Song_Vm 
	 */
	public function Build() {
		$this->fname = FileHelper::getFilename();
		$data = FileHelper::getFile(Config::SongDirectory . $this->fname);
		$this->song = SongHelper::parseSong($data);

		$title = htmlspecialchars((($this->song->isOK) ? ($this->song->title . ((strlen($this->song->subtitle) > 0) ? (' | ' . $this->song->subtitle) : '')) : 'Not Found'));
		
		$viewModel = new Song_Vm();
		$viewModel->PageTitle = ((strlen($title) > 0) ? $title : $this->fname) . ' ' . Config::PageTitleSuffix;
		$viewModel->SongTitle = htmlspecialchars($this->song->title);
		$viewModel->Subtitle = htmlspecialchars($this->song->subtitle);
		$viewModel->Artist = $this->song->artist;
		$viewModel->Album = $this->song->album; // htmlspecialchars();
		$viewModel->Body = $this->song->body;
		$viewModel->UgsMeta = $this->song->meta;
		$viewModel->SourceUri = ((Config::UseModRewrite) ? '/source/' : '/song-source.php?song=' ) . $this->fname;

		header('X-Powered-By: ' . Config::PoweredBy);
		return $viewModel;
	}
	
}

