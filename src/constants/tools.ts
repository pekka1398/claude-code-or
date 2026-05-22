
import { TASK_OUTPUT_TOOL_NAME } from '../tools/TaskOutputTool/constants.js'
import { AGENT_TOOL_NAME } from '../tools/AgentTool/constants.js'
import { TASK_STOP_TOOL_NAME } from '../tools/TaskStopTool/prompt.js'
import { FILE_READ_TOOL_NAME } from '../tools/FileReadTool/prompt.js'
import { SHELL_TOOL_NAMES } from '../utils/shell/shellToolUtils.js'
import { FILE_EDIT_TOOL_NAME } from '../tools/FileEditTool/constants.js'
import { FILE_WRITE_TOOL_NAME } from '../tools/FileWriteTool/prompt.js'
import { SEND_MESSAGE_TOOL_NAME } from '../tools/SendMessageTool/constants.js'
import { TASK_CREATE_TOOL_NAME } from '../tools/TaskCreateTool/constants.js'
import { TASK_GET_TOOL_NAME } from '../tools/TaskGetTool/constants.js'
import { TASK_LIST_TOOL_NAME } from '../tools/TaskListTool/constants.js'
import { TASK_UPDATE_TOOL_NAME } from '../tools/TaskUpdateTool/constants.js'
// Deleted tool constants — replaced with inline string literals:
// const EXIT_PLAN_MODE_V2_TOOL_NAME = 'exit_plan_mode'
// const ENTER_PLAN_MODE_TOOL_NAME = 'enter_plan_mode'
// const ASK_USER_QUESTION_TOOL_NAME = 'ask_user_question'
// const WEB_SEARCH_TOOL_NAME = 'web_search'
// const TODO_WRITE_TOOL_NAME = 'todo_write'
// const GREP_TOOL_NAME = 'grep'
// const WEB_FETCH_TOOL_NAME = 'web_fetch'
// const GLOB_TOOL_NAME = 'glob'
// const NOTEBOOK_EDIT_TOOL_NAME = 'notebook_edit'
// const SKILL_TOOL_NAME = 'skill'
// const TOOL_SEARCH_TOOL_NAME = 'tool_search'
// const ENTER_WORKTREE_TOOL_NAME = 'enter_worktree'
// const EXIT_WORKTREE_TOOL_NAME = 'exit_worktree'
// SyntheticOutputTool removed — no longer imported
// WorkflowTool removed — no longer imported
// ScheduleCronTool removed — no longer imported

export const ALL_AGENT_DISALLOWED_TOOLS = new Set([
  TASK_OUTPUT_TOOL_NAME,
  'exit_plan_mode',
  'enter_plan_mode',
  // Allow Agent tool for agents when user is ant (enables nested agents)
  ...(process.env.USER_TYPE === 'ant' ? [] : [AGENT_TOOL_NAME]),
  'ask_user_question',
  TASK_STOP_TOOL_NAME,
  // WorkflowTool removed (directory deleted); feature('WORKFLOW_SCRIPTS') was always false
])

export const CUSTOM_AGENT_DISALLOWED_TOOLS = new Set([
  ...ALL_AGENT_DISALLOWED_TOOLS,
])

/*
 * Async Agent Tool Availability Status (Source of Truth)
 */
export const ASYNC_AGENT_ALLOWED_TOOLS = new Set([
  FILE_READ_TOOL_NAME,
  'web_search',
  'todo_write',
  'grep',
  'web_fetch',
  'glob',
  ...SHELL_TOOL_NAMES,
  FILE_EDIT_TOOL_NAME,
  FILE_WRITE_TOOL_NAME,
  'notebook_edit',
  'skill',
  // SYNTHETIC_OUTPUT_TOOL_NAME removed (tool directory deleted)
  'tool_search',
  'enter_worktree',
  'exit_worktree',
])
/**
 * Tools allowed only for in-process teammates (not general async agents).
 * These are injected by inProcessRunner.ts and allowed through filterToolsForAgent
 * via isInProcessTeammate() check.
 */
export const IN_PROCESS_TEAMMATE_ALLOWED_TOOLS = new Set([
  TASK_CREATE_TOOL_NAME,
  TASK_GET_TOOL_NAME,
  TASK_LIST_TOOL_NAME,
  TASK_UPDATE_TOOL_NAME,
  SEND_MESSAGE_TOOL_NAME,
  // ScheduleCronTool removed (directory deleted); feature('AGENT_TRIGGERS') was always false
])

/*
 * BLOCKED FOR ASYNC AGENTS:
 * - AgentTool: Blocked to prevent recursion
 * - TaskOutputTool: Blocked to prevent recursion
 * - ExitPlanModeTool: Plan mode is a main thread abstraction.
 * - TaskStopTool: Requires access to main thread task state.
 * - TungstenTool: Uses singleton virtual terminal abstraction that conflicts between agents.
 *
 * ENABLE LATER (NEED WORK):
 * - MCPTool: TBD
 * - ListMcpResourcesTool: TBD
 * - ReadMcpResourceTool: TBD
 */

/**
 * Tools allowed in coordinator mode - only output and agent management tools for the coordinator
 */
export const COORDINATOR_MODE_ALLOWED_TOOLS = new Set([
  AGENT_TOOL_NAME,
  TASK_STOP_TOOL_NAME,
  SEND_MESSAGE_TOOL_NAME,
  // SYNTHETIC_OUTPUT_TOOL_NAME removed (tool directory deleted)
])
