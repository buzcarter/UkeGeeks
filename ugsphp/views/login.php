<?php
// requires View Model "Login_Vm"
//
$errCssstyle = (strlen($model->ErrorMessage) > 0) ? 'block' : 'none';

?>
<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title><?php echo(h($model->PageTitle)); ?></title>
	<meta name="generator" content="<?php echo(h($model->PoweredBy)) ?>" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.min.css" title="ugsEditorCss" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsphp.css" />
</head>
<body class="loginPage">
<section class="contentWrap">
</section>
<section class="ugsEditor-overlay">
	<hgroup>
		<h3>Login</h3>
	</hgroup>
	<div>
	<form method="post" action="<?php echo(h($model->FormPostUri)); ?>" id="loginForm">
		<p class="errorMessage" id="loginErrorMessage" style="display: <?php echo($errCssstyle); ?>"><?php echo(h($model->ErrorMessage)); ?></p>
		<ul>
			<li>
				<label for="username">Username:</label>
				<input type="text" name="username" id="username" size="20" value="<?php echo(h($model->Username)); ?>" />
			</li>
			<li>
				<label for="password">Password:</label>
				<input type="password" name="password" id="password" size="20" />
				<p class="hint">yo! this is cAsEsenSiTIvE.</p>
			</li>
			<li class="ugsEditor-btnBar">
				<input type="submit" value="Login" name="loginBtn" class="ugsEditor-baseBtn ugsEditor-blueBtn" />
			</li>
		</ul>
		<p class="help">Problems or you need access? <a href="mailto:<?php echo(h($model->SupportEmail)); ?>?subject=I humbly beseech thee, songbook access, please...">Drop a line.</a></p>
	</form>
</div>
</section>
<script type="text/javascript">
ugsLogin = (function(){
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	_public.init = function(){
		window.onload = readyForm;
		document.getElementById('loginForm').onsubmit = function(){ return doSubmit(); };
	};

	var readyForm = function(){
		var h = document.getElementById('username');
		if (h.value.length < 1){
			h.focus();
		}
		else{
			document.getElementById('password').focus();
		}
	};

	var doSubmit = function(){
		var ok = (document.getElementById('username').value.length > 3) && (document.getElementById('password').value.length > 3);
		var err = document.getElementById('loginErrorMessage');
		if (!ok){
			err.textContent = 'Check your username & password';
			readyForm();
		}
		err.style.display = ok ? 'none' : 'block';
		return ok;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());

ugsLogin.init();

</script>
</body>
</html>