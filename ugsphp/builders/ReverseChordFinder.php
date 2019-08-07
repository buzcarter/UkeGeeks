<?php
class ReverseChordFinder_Vmb extends _base_Vmb {

	public function Build() {
		$viewModel = new ReverseChordFinder_Vm();
		$viewModel->PageTitle = Lang::Get('reverse_chord_finder');
		return $viewModel;
	}

}

