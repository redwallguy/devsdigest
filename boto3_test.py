import re

regex = re.compile(r"""(\/\*static\*\/\s*["'](.*?)["']\s*\/\*endstatic\*\/)""")

s = """import * as $ from /*static*/ 'devsite/js/lib/jquery.js' /*endstatic*/;
jQuery = $;

import * as base from /*static*/'devsite/js/scripts/base.js'/*endstatic*/;
import * as helper from /*static*/'devsite/js/scripts/2048helpers.js'/*endstatic*/;
import * as _ from /*static*/'devsite/js/lib/underscore_min.js'/*endstatic*/;"""

for m in regex.findall(s):
    print(m)

(("*.css", (r"""(url\(['"]{0,1}\s*(.*?)["']{0,1}\))""",(r"""(@import\s*["']\s*(.*?)["'])""", """@import url("%s")"""),)),)

(("*.js", ((r"""(\/\*static\*\/\s*["'](.*?)["']\s*\/\*endstatic\*\/)""", """ "%s" """),)),)
