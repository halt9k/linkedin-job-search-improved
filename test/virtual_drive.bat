REM Even if you run this command from same user as browser,
REM Elevated / Non-elevated mix will not allow file:///V:/ access

subst /d v:
subst V: ../src

set /p DUMMY=Hit ENTER to continue...