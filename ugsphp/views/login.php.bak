<?php
// requires View Model "Login_Vm"
?>
<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title><?php echo($model->PageTitle); ?></title>
	<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
	<link rel="stylesheet" href="/css/ugsphp.css" />
</head>
<body class="loginPage">
<div class="contentWrap">
	<form method="post" action="<?php echo($model->FormPostUri); ?>" id="loginForm">
		<?php if (strlen($model->ErrorMessage)>0): ?>
			<p class="errorMessage"><?php echo($model->ErrorMessage); ?></p>
		<?php endif; ?>
		<ul>
			<li>
				<label for="username">Username:</label>
				<input type="text" name="username" id="username" size="20" value="<?php echo($model->Username); ?>" />
			</li>
			<li>
				<label for="password">Password:</label>
				<input type="password" name="password" id="password" size="20" />
				<p class="hint">yo! this is cAsEsenSiTIvE.</p>
			</li>
			<li class="btn">
				<input type="submit" value="Login" name="loginBtn" />
			</li>
		</ul>
		<p class="help">Problems or you need access? <a href="mailto:<?php echo($model->SuportEmail); ?>?subject=I humbly beseech thee, songbook access, please...">Drop a line.</a></p>
	</form>
</div>
<script type="text/javascript">
ugsLogin = new function(){

	this.init = function(){
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
		var ok = (document.getElementById('username').value.length > 3) && (document.getElementById('password').value.length > 3);
		if (!ok){
			alert('Check your username & password');
			readyForm();
		}
		return ok;
	};
};

ugsLogin.init();

</script>
</body>
</html>