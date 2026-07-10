import Modal from 'react-modal';

export const BaseModalStyle: Modal.Styles = {
  overlay: {
    zIndex: 100000,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(6px)',
  },
  content: {
    padding: 0,
    border: 'none',
    borderRadius: 0,
    width: 'fit-content',
    height: 'fit-content',
    background: 'rgba(0,0,0,0)',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    // marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'hidden',
  },
};
