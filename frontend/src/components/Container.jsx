function Container({ as: Component = "div", className = "", children }) {
  const classes = ["app-container", className].filter(Boolean).join(" ");

  return <Component className={classes}>{children}</Component>;
}

export default Container;
