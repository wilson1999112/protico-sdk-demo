import React, {
  Component,
  ReactNode,
  CSSProperties,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { throttle } from "throttle-debounce";
import { ThresholdUnits, parseThreshold } from "./utils/threshold";

type AsyncFn = () => Promise<any>;
export interface Props {
  next: AsyncFn;
  previous: AsyncFn;
  hasMore: boolean;
  hasPrevious: boolean;
  children: ReactNode;
  loader: ReactNode;
  scrollThreshold?: number | string;
  endMessage?: ReactNode;
  style?: CSSProperties;
  height?: number | string;
  scrollableTarget?: ReactNode;
  hasChildren?: boolean;
  inverse?: boolean;
  dataLength: number;
  className?: string;
  setIsScrollAbove?: any;
}

const InfiniteScroll: React.FC<Props> = (props) => {
  const [showLoader, setShowLoader] = useState(false);

  const outerDivStyle = {};
  const style = {
    height: props.height || "auto",
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
    justifyContent: "flex-start !important",
    ...props.style,
  } as CSSProperties;
  const hasChildren =
    props.hasChildren ||
    !!(
      props.children &&
      props.children instanceof Array &&
      props.children.length
    );

  const _scrollableNode = useRef<HTMLElement | null>(null);
  const el = useRef<HTMLElement | Window | null>(null);
  const _infScroll = useRef<HTMLDivElement | null>(null);
  const actionTriggeredRef = useRef(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const isElementAtTop = (
    target: HTMLElement,
    scrollThreshold: string | number = 0.8
  ) => {
    const clientHeight =
      target === document.body || target === document.documentElement
        ? window.screen.availHeight
        : target.clientHeight;

    const threshold = parseThreshold(scrollThreshold);

    if (threshold.unit === ThresholdUnits.Pixel) {
      return (
        target.scrollTop <=
        threshold.value + clientHeight - target.scrollHeight + 1
      );
    }

    return (
      Math.abs(target.scrollTop) <=
      Math.min(target.scrollHeight * (1 - threshold.value / 100), 1200)
    );
  };

  const isElementAtBottom = (
    target: HTMLElement,
    scrollThreshold: string | number = 0.8
  ) => {
    const clientHeight =
      target === document.body || target === document.documentElement
        ? window.screen.availHeight
        : target.clientHeight;

    const threshold = parseThreshold(scrollThreshold);

    if (threshold.unit === ThresholdUnits.Pixel) {
      return (
        target.scrollTop + clientHeight >= target.scrollHeight - threshold.value
      );
    }

    return (
      Math.abs(target.scrollTop) + clientHeight >= target.scrollHeight - 500
      //   (threshold.value / 100) * target.scrollHeight
    );
  };
  const scrollTimeout = useRef<any>(null);

  const onScrollListener = useCallback(
    (event: Event) => {
      event.preventDefault();
      setIsScrolling(true);
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 150);

      const target =
        props.height || _scrollableNode.current
          ? (event.target as HTMLElement)
          : document.documentElement.scrollTop
          ? document.documentElement
          : document.body;

      const scrollTop = target.scrollTop;
      const scrollingDown =
        scrollTop > lastScrollTop && scrollTop - lastScrollTop < 200;
      setLastScrollTop(scrollTop); // update last scroll position

      if (props.setIsScrollAbove) {
        props.setIsScrollAbove(Math.abs(scrollTop) > 1000);
      }

      const atBottom = props.inverse
        ? isElementAtTop(target, props.scrollThreshold)
        : isElementAtBottom(target, props.scrollThreshold);

      const atTop = props.inverse
        ? isElementAtBottom(target, props.scrollThreshold)
        : isElementAtTop(target, props.scrollThreshold);

      // return immediately if the action has already been triggered,
      // prevents multiple triggers.
      if (actionTriggeredRef.current) return;

      // call the `next` function in the props to trigger the next data fetch
      if (atTop && props.hasMore) {
        actionTriggeredRef.current = true;
        setShowLoader(true);
        props.next().then(() => {
          actionTriggeredRef.current = false;
          setShowLoader(false);
        });
      }

      // call the `previous` function in the props to trigger the previous data fetch
      if (atBottom && props.hasPrevious && scrollingDown) {
        actionTriggeredRef.current = true;
        setShowLoader(true);
        props.previous().then(() => {
          actionTriggeredRef.current = false;
          setShowLoader(false);
        });
      }
    },
    [
      props.next,
      props.hasMore,
      props.previous,
      props.hasPrevious,
      actionTriggeredRef.current,
      lastScrollTop,
    ]
  ); // 加入 props.previous 和 props.hasPrevious 到依賴陣列

  const getScrollableTarget = () => {
    if (props.scrollableTarget instanceof HTMLElement)
      return props.scrollableTarget;
    if (typeof props.scrollableTarget === "string") {
      return document.getElementById(props.scrollableTarget);
    }
    if (props.scrollableTarget === null) {
      console.warn(`You are trying to pass scrollableTarget but it is null. This might
        happen because the element may not have been added to DOM yet.
        See https://github.com/ankeetmaini/react-infinite-scroll-component/issues/59 for more info.
      `);
    }
    return null;
  };

  useEffect(() => {
    return () => {
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (typeof props.dataLength === "undefined") {
      throw new Error(
        `mandatory prop "dataLength" is missing. The prop is needed` +
          ` when loading more content. Check README.md for usage`
      );
    }

    _scrollableNode.current = getScrollableTarget();
    el.current = props.height
      ? _infScroll.current
      : _scrollableNode.current || window;

    // const target = _scrollableNode.current;

    // const test = setInterval(() => {
    //   console.log("target.scrollTop: ", target.scrollTop);
    //   console.log("target.scrollHeight: ", target.scrollHeight);
    // }, 100);

    const throttledOnScrollListener = throttle(150, onScrollListener);
    if (el.current) {
      el.current.addEventListener("scroll", throttledOnScrollListener);
    }

    return () => {
      if (el.current) {
        el.current.removeEventListener("scroll", throttledOnScrollListener);
      }
      //   clearInterval(test);
    };
  }, [onScrollListener]);

  const prevDataLengthRef = useRef(props.dataLength);
  useEffect(() => {
    if (_scrollableNode && _scrollableNode.current) {
      const element = _scrollableNode.current;

      const currentScrollPosition = element.scrollTop;

      if (
        props.dataLength >= prevDataLengthRef.current &&
        currentScrollPosition != 0
      ) {
        requestAnimationFrame(() => {
          // 在下一個 frame 設定滾動位置
          element.scrollTop = currentScrollPosition;
        });
      }

      // Update the previous data length value for the next render
      prevDataLengthRef.current = props.dataLength;
    }
  }, [props.dataLength]);

  return (
    <div style={outerDivStyle} className="infinite-scroll-component__outerdiv">
      <div
        className={`infinite-scroll-component ${props.className || ""}`}
        style={style}
      >
        {props.children}
        {!showLoader && !hasChildren && props.hasMore && props.loader}
        {showLoader && props.hasMore && props.loader}
        {!props.hasMore && props.endMessage}
      </div>
    </div>
  );
};
export default InfiniteScroll;
