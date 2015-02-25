    
    <header>{APP_TITLE}</header>
    
    <nav id="login_div_alert"></nav>
    
    <article>
    	<section>
    		<dl>
    			<dt>
    				{username_label}
    			</dt>
    			<dd>
    				<input type="text" id="login_tb_username"/>
    			</dd>
    			<dt>
    				{password_label}
    			</dt>
    			<dd>
    				<input type="password" id="login_tb_password"/>
    				<div class="right"><a href="javascript:(0)" id="login_btn_forgot">{forget_password}</a></div>
    			</dd>
    			<dt>
    			</dt>
    			<dd>
    				<input type="checkbox" id="login_checkbox" value="1"/>
    				    {savelogin_label}
    			</dd> 
            </dl>
    		<p>
    			<a class="button" id="login_btn_login">{login}</a>
    		</p>
    	</section>
    </article>
