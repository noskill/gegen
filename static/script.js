$(document).ready(function() {
    // Populate the model dropdown list on page load
    $.ajax({
        type: "GET",
        url: "/api/models", // Replace with the URL of your backend endpoint
        success: function(response) {
            var models = response.models; // Assuming the response contains the list of available models
            
            // Populate the dropdown list with model options
            var modelDropdown = $("#model-id");
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                var option = $('<option>', {
                    value: model,
                    text: model
                });
                modelDropdown.append(option);
            }
        },
        error: function() {
            alert("Error loading available models");
        }
    });

    // Submit form
    $("#image-generator-form").submit(function(event) {
        event.preventDefault(); // Prevent the form from submitting normally
        
        // Get input values
        var textPrompt = $("#text-prompt").val();
        var inferenceSteps = $("#inference-steps").val();
        var seed = $("#seed").val();
        var modelId = $("#model-id").val();
        var height = $("#height").val();
        var width = $("#width").val();
        
        // Create the request payload as a JavaScript object
        var requestData = {
            textPrompt: textPrompt,
            inferenceSteps: inferenceSteps,
            seed: seed,
            modelId: modelId,
            height: height,
            width: width
        };

        // Send request to start image generation
        $.ajax({
            type: "POST",
            url: "/api/generate", // Replace with the URL of your backend endpoint
            contentType: "application/json", // Set the request content type to JSON
            data: JSON.stringify(requestData), 
            success: function(response) {
                var jobId = response.jobId; // Assuming the response contains the job ID
                
                // Store the job ID in a cookie
                document.cookie = "jobId=" + jobId + "; path=/"; // Set the cookie with a name, value, and path

                // ...
                
                // Start querying the backend for job completion
                checkJobStatus(jobId);
            },
            error: function() {
                alert("Error starting image generation");
            }
        });
    });
    
    // Function to check job status
    function checkJobStatus(jobId) {
        $.ajax({
            type: "GET",
            url: "/api/check", // Replace with the URL of your backend endpoint
            data: {
                jobId: jobId
            },
            success: function(response) {
                if (response.status === "completed") {
                    var imageData = response.image_base64; // Assuming the response contains the base64 image data
                    
                    // Display the generated image
                    $("#image-container").html('<img src="data:image/png;base64,' + imageData + '">');
                } else if (response.status === "pending" || response.status === "processing") {
                    // Job is still pending or processing, continue checking
                    setTimeout(function() {
                        checkJobStatus(jobId);
                    }, 2000); // Wait for 2 seconds before checking again (adjust as needed)
                } else {
                    // Job failed or encountered an error
                    alert("Image generation failed. Please try again.");
                }
            },
            error: function() {
                alert("Error checking job status");
            }
        });
    }
});
