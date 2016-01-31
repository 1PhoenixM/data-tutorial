var socket = io();
			/* with socket.io - look out for if all users can see a POST change or just the one!! */
			socket.on('newCharacter', function(msg){
				//$('body').append("!");
				display();
			});
			
			function newBox(){
				console.log("?");
				$.post('http://localhost:8080/box/gameswiki', { name: "gameswiki" })
				.done(function( data ) {
					console.log(data);
					alert( "Data Loaded: " + data.keys );
				});
			}
			
			function newCharacter(){
				console.log("?");
				$.post('http://localhost:8080/data/myBox/Test', { "id": "8" })
				.done(function( data ) {
					console.log(data);
					alert("Success!");
					socket.emit('newCharacter', "7");
				});
			}
			
			function updateCharacter(){
				console.log("?");
				$.ajax({
				url: 'http://localhost:8080/data/myBox/resource/Test?id=6',
				type: 'PUT',
				data: "{ \"name\": \"'TheLife'\" }",
				success: function(result) {
					alert("Success!");
					socket.emit('newCharacter', "7");
				}
				});
			}
			
			function deleteCharacter(){
				console.log("?");
				$.ajax({
				url: 'http://localhost:8080/data/myBox/resource/Test?id=8',
				type: 'DELETE',
				success: function(result) {
					alert("Success!");
					socket.emit('newCharacter', "7");
				}
				});
			}
			
			function display(){
				$.getJSON("http://localhost:8080/data/myBox/resource/Test/id,name,imageID", function(res){
					$("#info").html("");
					$.each(res.data, function(i, field){
						$("#info").append(field.id + " " + field.name);
						if(field.imageid < 6){
							$("#info").append("<img style='width:30px;height:30px;' src='http://localhost:8080/file/" + field.imageid + "'><br />");
						}
					});
				});
			}
			
			function getAllResources(){
				var boxname = document.cookie;
				boxname = boxname.split("=")[1];
				$.getJSON("http://localhost:8080/resource/" + boxname, function(res){
					$("#resources").html("");
					$.each(res.data, function(i, field){
						$("#resources").append("<option>" + field.resource + "</option>");
					});
				});
			}
			
			function newResourceMenu(){
				$("#inner-menu").html("");
				$("#inner-menu").html("Name: <input type='text' id='resourceName'><br /><button onclick='createResource()'>Create</button>");
			}
			
			function createResource(){
				var boxname = document.cookie;
				boxname = boxname.split("=")[1];
				resourceName = $("#resourceName").val();
				$.post('http://localhost:8080/resource/' + boxname + '/' + resourceName, { name: resourceName })
				.done(function( data ) {
					console.log(data);
					alert( "Resource Loaded: " + data.message );
					getAllResources();
					$("#inner-menu").html("<button onclick='newResourceMenu()'>New Resource</button><button onclick='modifyResourceMenu()'>Modify or Remove Resources</button>");
				});
			}