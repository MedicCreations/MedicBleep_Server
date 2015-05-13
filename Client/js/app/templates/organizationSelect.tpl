    
    <header>{spika_title}</header>
    
    <article>
    	<section>
    		<dl>
    			<dt>
    				{select_organization}
    			</dt>
    			<dd id="organization_selectbox_holder">

    			</dd>
            </dl>
    		<p>
    			<a class="button red" id="cancel_btn">{cancel}</a>
    			<a class="button" id="select_org_btn">{select} <i class="fa fa-arrow-right"></i></a>
    		</p>
    	</section>
    </article>
    

    	<script type="text/template" id="template_selectbox">

			<select id="organization_select" class="box_select">
			
                <% _.each(organizations, function(organization) { %>
                
                    <option value="<%= organization.id %>"><%= organization.name %></option>
                
                <% }); %>
                            
			</select>
    				
        </script>


