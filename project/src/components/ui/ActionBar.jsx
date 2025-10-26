import { ActionButton, ACTION_TYPES } from './ActionButton';

export const ActionBar = ({
  actions = [],
  className = '',
  align = 'end',
  size = 'default',
}) => {
  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const getActionButton = (action) => {
    if (typeof action === 'string') {
      return (
        <ActionButton
          key={action}
          actionType={action}
          size={size}
        />
      );
    }

    const { type, onClick, disabled, loading, text, iconOnly, className: customClass } = action;
    
    return (
      <ActionButton
        key={type}
        actionType={type}
        onClick={onClick}
        disabled={disabled}
        isLoading={loading}
        customText={text}
        iconOnly={iconOnly}
        className={customClass}
        size={size}
      />
    );
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${alignmentClasses[align]} ${className}`}>
      {actions.map((action) => getActionButton(action))}
    </div>
  );
};

// Exemples d'utilisation :
/*
<ActionBar 
  actions={[
    'add',
    'edit',
    'delete',
    {
      type: 'custom',
      text: 'Personnalisé',
      onClick: () => console.log('Action personnalisée'),
      className: 'bg-purple-600 hover:bg-purple-700'
    }
  ]} 
  align="between"
  className="p-4 bg-gray-50 rounded-lg"
/>
*/

export default ActionBar;
