function customImageUploadHandler(blobInfo, progress) {
    return new Promise(function(resolve, reject) {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        // Get CSRF token
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        
        fetch('/admin/upload-image/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken ? csrfToken.value : '',
            },
            body: formData,
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.location) {
                resolve(data.location);
            } else {
                reject('Upload failed: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(function(error) {
            reject('Upload failed: ' + error.message);
        });
    });
}