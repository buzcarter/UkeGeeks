<?php

/**
 * View Model Builder -- Creates a "404" View Model
 * @class NotFound404_Vmb
 */
class NotFound404_Vmb extends _base_Vmb {

	public function Build() {
		$viewModel = new NotFound404_Vm();
		$viewModel->PageTitle = Lang::Get('not_found_title');
		return $viewModel;
	}

}

