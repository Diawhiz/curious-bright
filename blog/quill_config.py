"""
Quill Editor Configuration
WordPress Gutenberg-like toolbar
"""

QUILL_CONFIG = {
    'theme': 'snow',
    'modules': {
        'toolbar': [
            [{'header': [1, 2, 3, 4, 5, 6, False]}],
            [{'font': []}],
            [{'size': ['small', False, 'large', 'huge']}],
            ['bold', 'italic', 'underline', 'strike'],
            [{'color': []}, {'background': []}],
            [{'script': 'sub'}, {'script': 'super'}],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'indent': '-1'}, {'indent': '+1'}],
            [{'direction': 'rtl'}],
            [{'align': []}],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean'],
        ],
        'syntax': True,
    },
    'placeholder': 'Start writing your story...',
    'bounds': '.django-quill-widget',
}

# Advanced config with more options
QUILL_CONFIG_ADVANCED = {
    'theme': 'snow',
    'modules': {
        'toolbar': {
            'container': [
                [{'header': [1, 2, 3, 4, 5, 6, False]}],
                [{'font': []}],
                [{'size': ['small', False, 'large', 'huge']}],
                ['bold', 'italic', 'underline', 'strike'],
                [{'color': []}, {'background': []}],
                [{'script': 'sub'}, {'script': 'super'}],
                [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
                [{'indent': '-1'}, {'indent': '+1'}],
                [{'direction': 'rtl'}],
                [{'align': []}],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video', 'formula'],
                [{'table': 'table'}],
                ['clean'],
            ],
            'handlers': {}
        },
        'table': True,
        'syntax': True,
    },
    'placeholder': 'Start writing your amazing content...',
}
