from django.conf import settings
from django.contrib.staticfiles.storage import ManifestFilesMixin, StaticFilesStorage
from storages.backends.s3boto3 import S3Boto3Storage, SpooledTemporaryFile
from django.utils.six.moves.urllib.parse import (
    unquote, urlsplit, urlunsplit, urldefrag
)
import os, re, logging, posixpath

logger = logging.getLogger('devsdigest')

class S3ManifestFilesStorage(ManifestFilesMixin, S3Boto3Storage):
    location = settings.STATICFILES_AWS_LOCATION

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

    def url_converter(self, name, hashed_files, template=None):
        """
        Return the custom URL converter for the given file name.
        """
        if template is None:
            template = self.default_template

        logger.debug("Template is: %s", template)
        def converter(matchobj):
            """
            Convert the matched URL to a normalized and hashed URL.
            This requires figuring out which files the matched URL resolves
            to and calling the url() method of the storage.
            """
            matched, url = matchobj.groups()
            logger.debug("Matched: %s, url: %s", matched, url)

            # Ignore absolute/protocol-relative and data-uri URLs.
            if re.match(r'^[a-z]+:', url):
                return matched

            # Ignore absolute URLs that don't point to a static file (dynamic
            # CSS / JS?). Note that STATIC_URL cannot be empty.
            if url.startswith('/') and not url.startswith(settings.STATIC_URL):
                return matched

            # Strip off the fragment so a path-like fragment won't interfere.
            url_path, fragment = urldefrag(url)
            logger.debug("url_path: %s, fragment: %s", url_path, fragment)

            if url_path.startswith('/'):
                # Otherwise the condition above would have returned prematurely.
                assert url_path.startswith(settings.STATIC_URL)
                target_name = url_path[len(settings.STATIC_URL):]
            #elif url_path.endswith("js"):
            #    target_name = url_path
            else:
                # We're using the posixpath module to mix paths and URLs conveniently.
                source_name = name if os.sep == '/' else name.replace(os.sep, '/')
                logger.debug("Source name: %s, url path: %s", source_name, url_path)
                target_name = posixpath.join(posixpath.dirname(source_name), url_path)

            logger.debug("Target name: %s", target_name)
            # Determine the hashed name of the target file with the storage backend.
            hashed_url = self._url(
                self._stored_name, unquote(target_name),
                force=True, hashed_files=hashed_files,
            )

            transformed_url = '/'.join(url_path.split('/')[:-1] + hashed_url.split('/')[-1:])

            # Restore the fragment that was stripped off earlier.
            if fragment:
                transformed_url += ('?#' if '?#' in url else '#') + fragment

            # Return the hashed version to the file
            ret_val = template % unquote(transformed_url)
            print("Returned value: %s", ret_val)
            return template % unquote(transformed_url)

        return converter
