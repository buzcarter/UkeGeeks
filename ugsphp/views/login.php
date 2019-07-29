<?php
// requires View Model "Login_Vm"
//
$errCssstyle = (strlen($model->ErrorMessage) > 0) ? 'block' : 'none';

?>
<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="utf-8" />
  <title><?php echo($model->PageTitle); ?> | <?php echo Config::SongbookHeadline?></title>
	<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.merged.css" title="ugsEditorCss" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsphp.css" />
</head>
<body class="loginPage">
<section class="contentWrap">
</section>
<section class="overlay">
	<hgroup>
		<h3>Login</h3>
	</hgroup>
	<div>
	<form method="post" action="<?php echo($model->FormPostUri); ?>" id="loginForm">
		<p class="errorMessage" id="loginErrorMessage" style="display: <?php echo($errCssstyle); ?>"><?php echo($model->ErrorMessage); ?></p>
		<ul>
			<li>
				<label for="username">Username</label>
				<input type="text" name="username" id="username" size="20" value="<?php echo($model->Username); ?>" />
			</li>
			<li>
				<label for="password">Password</label>
				<input type="password" name="password" id="password" size="20" />
			</li>
			<li class="btnBar">
				<input type="submit" value="Login" name="loginBtn" class="baseBtn blueBtn" />
			</li>
		</ul>
    <?php if(Config::ShowSupportEmail) {?>
		<p class="help">Problems or you need access? <a href="mailto:<?php echo($model->SupportEmail); ?>?subject=I humbly beseech thee, songbook access, please...">Drop a line.</a></p>
    <?}?>
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
		h = document.getElementById('username');
		if (h.value.length < 1){
			h.focus();
		}
		else{
			document.getElementById('password').focus();
		}
	};

	var doSubmit = function(){
		var ok = (document.getElementById('username').value.length >= 3) && (document.getElementById('password').value.length >= 3);
		var err = document.getElementById('loginErrorMessage');
		if (!ok){
			err.innerHTML = 'Check your username & password';
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
