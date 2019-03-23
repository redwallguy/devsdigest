from django.conf import settings
from django.contrib.staticfiles.storage import ManifestFilesMixin, StaticFilesStorage
from storages.backends.s3boto3 import S3Boto3Storage, SpooledTemporaryFile
import os, logging
logger = logging.getLogger('devsdigest')

class S3ManifestFilesStorage(ManifestFilesMixin, S3Boto3Storage):
    location = settings.STATICFILES_AWS_LOCATION
    patterns = ManifestFilesMixin.patterns + (("*.js", ((r"""(\/\*static\*\/\s*["'](.*?)["']\s*\/\*endstatic\*\/)""", """ "%s" """),)),)

    def _save_content(self, obj, content, parameters): # From: https://github.com/jschneier/django-storages/issues/382#issuecomment-377174808
        """
        We create a clone of the content file as when this is passed to boto3 it wrongly closes
        the file upon upload where as the storage backend expects it to still be open
        """
        # Seek our content back to the start
        content.seek(0, os.SEEK_SET)

        # Create a temporary file that will write to disk after a specified size
        content_autoclose = SpooledTemporaryFile()

        # Write our original content into our copy that will be closed by boto3
        content_autoclose.write(content.read())

        # Upload the object which will auto close the content_autoclose instance
        super(S3ManifestFilesStorage, self)._save_content(obj, content_autoclose, parameters)

        # Cleanup if this is fixed upstream our duplicate should always close
        if not content_autoclose.closed:
            content_autoclose.close()

class JSManifestFilesStorage(ManifestFilesMixin, StaticFilesStorage):
    patterns = ManifestFilesMixin.patterns + (("*.js", ((r"""(\/\*static\*\/\s*["'](.*?)["']\s*\/\*endstatic\*\/)""", """ "%s" """),)),)
