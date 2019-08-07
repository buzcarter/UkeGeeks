<?php
class ChordFinder_Vmb extends _base_Vmb {

	public function Build() {
		$viewModel = new ChordFinder_Vm();
		$viewModel->PageTitle = Lang::Get('chord_finder');
		return $viewModel;
	}

}

