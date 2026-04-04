import type { Command } from '../../commands.js'
import {
  isVoiceGrowthBookEnabled,
  isVoiceModeEnabled,
} from '../../voice/voiceModeEnabled.js'

const voice = {
  type: 'local',
  name: 'voice',
  description: 'Toggle voice mode',
  isEnabled: () => true,
  get isHidden() {
    return false
  },
  supportsNonInteractive: false,
  load: () => import('./voice.js'),
} satisfies Command

export default voice
