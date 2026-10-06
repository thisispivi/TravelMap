/*
 * Cursor requires its hook command under .cursor/, but the diagnostic runner is
 * the same one the Claude Code hook uses. Keeping one implementation means the
 * two integrations cannot drift apart.
 */
import "../../.claude/hooks/react-doctor.mjs";
