import logging
import sys
from django.utils.encoding import smart_str


class LogWrapper(object):
    def __init__(self, logger, wrapper_fname, wrapper_func):
        self.logger = logger
        self.wrapper_fname = wrapper_fname
        self.wrapper_func = wrapper_func

    def debug(self, msg, *args, **kwargs):
        """
        Log 'msg % args' with severity 'DEBUG'.

        To pass exception information, use the keyword argument exc_info with
        a true value, e.g.

        logger.debug("Houston, we have a %s", "thorny problem", exc_info=1)
        """
        if self.logger.isEnabledFor(logging.DEBUG):
            self._log(logging.DEBUG, msg, args, **kwargs)

    def info(self, msg, *args, **kwargs):
        """
        Log 'msg % args' with severity 'INFO'.

        To pass exception information, use the keyword argument exc_info with
        a true value, e.g.

        logger.info("Houston, we have a %s", "interesting problem", exc_info=1)
        """
        if self.logger.isEnabledFor(logging.INFO):
            self._log(logging.INFO, msg, args, **kwargs)

    def _log(self, level, msg, args, exc_info=None, extra=None):
        """
        Low-level logging routine which creates a LogRecord and then calls
        all the handlers of this logger to handle the record.
        """
        # IronPython doesn't track Python frames, so findCaller throws an
        # exception on some versions of IronPython. We trap it here so that
        # IronPython can use logging.
        try:
            caller_name, fn, lno, func = self.findCaller()
        except ValueError:
            caller_name, fn, lno, func = "root", "(unknown file)", 0, "(unknown function)"

        if exc_info:
            if not isinstance(exc_info, tuple):
                exc_info = sys.exc_info()
        logger_name = self.logger.name
        if logger_name == "root":
            logger_name = caller_name

        record = self.logger.makeRecord(
            logger_name, level, fn, lno, msg, args, exc_info, func, extra)
        self.logger.handle(record)

    def findCaller(self):
        """
        Find the stack frame of the caller so that we can note the source
        file name, line number and function name.
        """
        f = logging.currentframe()
        # On some versions of IronPython, currentframe() returns None if
        # IronPython isn't run with -X:Frames.

        if f is not None:
            f = f.f_back

        rv = "root", "(unknown file)", 0, "(unknown function)"
        while hasattr(f, "f_code"):
            co = f.f_code
            caller_name = f.f_globals['__name__']
            # filename = os.path.normcase(co.co_filename)
            if caller_name == self.wrapper_fname and co.co_name == self.wrapper_func:
                f = f.f_back
                continue

            rv = (caller_name, co.co_filename, f.f_lineno, co.co_name)
            break

        return rv


logger = logging.getLogger()


def debug(*args, **kwargs):
    # In order to track back true caller for logging
    func_name = sys._getframe().f_code.co_name
    log_wrapper = LogWrapper(
        logger,
        wrapper_fname=__name__,
        wrapper_func=func_name
    )

    debug_info = " ".join([smart_str(arg) for arg in args])
    log_wrapper.info(debug_info)
