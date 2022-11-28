import { css } from 'lit';

export const LivingWccellStyles = css`
  :host {
    display: block;
  }
  .cell {
    position: absolute;
    border-radius: 50%;
    background-color: plum;
    cursor: pointer;
    animation-duration: 2s;
    animation-name: show;
    opacity: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
  }

  @keyframes show {
    from {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes death {
    from {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }
`;