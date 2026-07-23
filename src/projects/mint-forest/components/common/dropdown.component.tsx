import { isEmpty } from '@/projects/mint-forest/utils';
import classNames from 'classnames';
import React, {
  PropsWithChildren,
  cloneElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Popover } from 'react-tiny-popover';

const Dropdown: React.FC<
  {
    trigger?: 'click' | 'hover';
    placement?: Array<'top' | 'right' | 'left' | 'bottom'>;
    content: () => React.ReactElement;
    visible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    onStatusChange?: (status: string) => void;
    onRef?: any;
    padding?: number;
    containerStyle?: Partial<CSSStyleDeclaration>;
    containerAnimation?: string;
  } & PropsWithChildren
> = (props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [contentStatus, setContentStatus] = useState<'init' | 'show' | 'hide'>('init');
  const realPosition = useRef<string>('');
  const moveInParent = useRef(false);

  useImperativeHandle(props.onRef, () => {
    return {
      hide,
      show,
    };
  });

  const show = () => {
    setIsPopoverOpen(true);
    setTimeout(() => {
      setContentStatus('show');
    }, 50);
  };

  const hide = () => {
    setTimeout(
      () => {
        if (moveInParent.current) {
          return;
        }

        setContentStatus('hide');
        setTimeout(() => {
          if (moveInParent.current) {
            return;
          }
          setIsPopoverOpen(false);
        }, 300);
      },
      props.trigger === 'click' ? 0 : 200
    );
  };

  const onMouseMoveOut = useCallback(
    (e: any) => {
      if (props.trigger === 'click') {
        return;
      }

      const moveOutPositon = { x: e.clientX, y: e.clientY };
      const targetRect = e.target.getBoundingClientRect();
      let moveOutPlacement = '';
      if (moveOutPositon.x <= targetRect.left - 5) {
        moveOutPlacement = 'left';
      } else if (moveOutPositon.x >= targetRect.right + 5) {
        moveOutPlacement = 'right';
      } else if (moveOutPositon.y <= targetRect.top + 5) {
        moveOutPlacement = 'top';
      } else if (moveOutPositon.y >= targetRect.bottom - 5) {
        moveOutPlacement = 'bottom';
      }

      if (realPosition.current != moveOutPlacement) {
        hide();
      }
    },
    [realPosition, props.trigger]
  );

  const parentEvents = useMemo(() => {
    if (!props.trigger) {
      return {};
    }

    if (props.trigger === 'click') {
      return {
        onClick: () => {
          isPopoverOpen ? hide() : show();
        },
      };
    }

    return {
      onMouseEnter: () => {
        moveInParent.current = true;
        show();
      },
      onMouseLeave: (e: any) => {
        moveInParent.current = false;
        onMouseMoveOut(e);
      },
    };
  }, [props.trigger, onMouseMoveOut, isPopoverOpen]);

  const onMouseLeaveContent = useCallback(() => {
    if (props.trigger !== 'hover') {
      return;
    }
    hide();
  }, [props.trigger]);

  const handleElment = useMemo(
    () => (props.children ? cloneElement(props.children as any, { ...parentEvents }) : <></>),
    [props.children, parentEvents]
  );

  useEffect(() => {
    props.onVisibleChange && props.onVisibleChange(isPopoverOpen);
  }, [isPopoverOpen, props.onVisibleChange]);

  useEffect(() => {
    props.onStatusChange && props.onStatusChange(contentStatus);
  }, [contentStatus, props.onStatusChange]);

  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={props.placement}
      padding={isEmpty(props.padding) ? 10 : props.padding}
      reposition={true}
      onClickOutside={hide}
      containerClassName="z-50"
      align="center"
      containerStyle={{
        zIndex: '98',
        ...props.containerStyle,
      }}
      content={(e: any) => {
        realPosition.current = e.position;

        return (
          <div
            className={classNames(
              props.containerAnimation,
              {
                'rc-dropdown-animation-reverse':
                  !props.containerAnimation && props.placement && props.placement[0] === 'bottom',
                'rc-dropdown-animation':
                  !props.containerAnimation && props.placement && props.placement[0] !== 'bottom',
              },
              {
                show: contentStatus === 'show',
                hide: contentStatus === 'hide',
              }
            )}
            // onClick={hide}
            onMouseLeave={onMouseLeaveContent}
          >
            {props.content()}
          </div>
        );
      }}
    >
      {handleElment}
    </Popover>
  );
};

export default Dropdown;
