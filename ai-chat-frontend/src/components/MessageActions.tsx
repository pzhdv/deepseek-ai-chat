import { FiChevronDown, FiChevronUp, FiRefreshCcw } from 'react-icons/fi'

interface MessageActionsProps {
  isAI: boolean
  isLoading: boolean
  isLastMessage: boolean
  onRegenerate: () => void
  isLongMessage: boolean
  isExpanded: boolean
  toggleExpand: () => void
}

const MessageActions: React.FC<MessageActionsProps> = ({
  isAI,
  isLoading,
  onRegenerate,
  isLongMessage,
  isExpanded,
  toggleExpand,
  isLastMessage,
  // 其他可选参数
}) => {
  return (
    <div className="flex  justify-between">
      <div></div>
      <div className="flex gap-2 mt-2">
        {isAI && !isLoading && isLastMessage && (
          <button
            onClick={onRegenerate}
            className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-700 text-sm flex items-center gap-1"
            aria-label="Regenerate response"
          >
            <FiRefreshCcw className="w-4 h-4" />
            重新生成
          </button>
        )}

        {isLongMessage && !isLoading && (
          <button
            onClick={toggleExpand}
            className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-700 text-sm flex items-center gap-1"
            aria-label={isExpanded ? 'Show less' : 'Show more'}
          >
            {isExpanded ? (
              <>
                <FiChevronUp className="w-4 h-4" />
                折叠
              </>
            ) : (
              <>
                <FiChevronDown className="w-4 h-4" />
                展开
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default MessageActions
