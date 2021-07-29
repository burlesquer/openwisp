import {shallow} from "enzyme";
import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import renderer from "react-test-renderer";

import getConfig from "../../utils/get-config";
import loadTranslation from "../../utils/load-translation";
import Header from "./header";

jest.mock("../../utils/get-config");
jest.mock("../../utils/load-translation");
const defaultConfig = getConfig("default", true);
const headerLinks = [
  {
    text: {en: "link-1"},
    url: "link-1/",
  },
  {
    text: {en: "link-2"},
    url: "link-2/",
    authenticated: false,
  },
  {
    text: {en: "link-3"},
    url: "link-3/",
    authenticated: true,
  },
  {
    text: {en: "link-4"},
    url: "link-4/",
    authenticated: true,
    verified: true,
  },
];
const getLinkText = (wrapper, text) => {
  const texts = [];
  wrapper.find(text).forEach((node) => {
    texts.push(node.text());
  });
  return texts;
};
const createTestProps = (props) => {
  return {
    setLanguage: jest.fn(),
    orgSlug: "default",
    language: "en",
    languages: [
      {slug: "en", text: "english"},
      {slug: "it", text: "italian"},
    ],
    header: defaultConfig.components.header,
    location: {
      pathname: "/default/login",
    },
    userData: {is_verified: true},
    ...props,
  };
};

describe("<Header /> rendering with placeholder translation tags", () => {
  const props = createTestProps();
  it("should render translation placeholder correctly", () => {
    const wrapper = shallow(<Header {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

describe("<Header /> rendering", () => {
  let props;
  let wrapper;
  beforeEach(() => {
    props = createTestProps();
    wrapper = shallow(<Header {...props} />);
    loadTranslation("en", "default");
  });
  it("should render without links", () => {
    const links = {
      header: {
        ...props.header,
        links: [],
      },
    };
    props = createTestProps(links);
    const component = renderer
      .create(
        <Router>
          <Header {...props} />
        </Router>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
  it("should render without authenticated links when not authenticated", () => {
    props = createTestProps();
    props.isAuthenticated = false;
    props.header.links = headerLinks;
    wrapper = shallow(<Header {...props} />);
    const linkText = getLinkText(wrapper, ".header-link");
    expect(linkText).toContain("link-1");
    expect(linkText).toContain("link-2");
    expect(linkText).not.toContain("link-3");
  });
  it("should render with authenticated links when authenticated", () => {
    props = createTestProps();
    props.isAuthenticated = true;
    props.header.links = headerLinks;
    wrapper = shallow(<Header {...props} />);
    const linkText = getLinkText(wrapper, ".header-link");
    expect(linkText).toContain("link-1");
    expect(linkText).not.toContain("link-2");
    expect(linkText).toContain("link-3");
  });
  it("should render with links", () => {
    const component = renderer
      .create(
        <Router>
          <Header {...props} />
        </Router>,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
  it("should not render with verified links if not verified", () => {
    props = createTestProps();
    props.isAuthenticated = true;
    props.userData.is_verified = false;
    props.header.links = headerLinks;
    wrapper = shallow(<Header {...props} />);
    const linkText = getLinkText(wrapper, ".header-link");
    expect(linkText).toContain("link-1");
    expect(linkText).not.toContain("link-2");
    expect(linkText).toContain("link-3");
    expect(linkText).not.toContain("link-4");
  });
  it("should render 2 links", () => {
    expect(wrapper.find(".header-desktop-link")).toHaveLength(2);
  });
  it("should render 2 languages", () => {
    expect(wrapper.find(".header-desktop-language-btn")).toHaveLength(2);
  });
  it("should render english as default language", () => {
    expect(
      wrapper.find(
        ".header-desktop-language-btn.header-language-btn-en.active",
      ),
    ).toHaveLength(1);
    expect(
      wrapper.find(
        ".header-desktop-language-btn.header-language-btn-it.active",
      ),
    ).toHaveLength(0);
  });
  it("should render logo", () => {
    expect(
      wrapper.find(".header-logo-image.header-desktop-logo-image"),
    ).toHaveLength(1);
  });
  it("should not render logo", () => {
    const logo = {
      header: {
        ...props.header,
        logo: null,
      },
    };
    props = createTestProps(logo);
    wrapper = shallow(<Header {...props} />);
    expect(
      wrapper.find(".header-logo-image.header-desktop-logo-image"),
    ).toHaveLength(0);
  });
});

describe("<Header /> interactions", () => {
  let props;
  let wrapper;
  beforeEach(() => {
    props = createTestProps();
    wrapper = shallow(<Header {...props} />);
  });
  it("should call setLanguage function when 'language button' is clicked", () => {
    wrapper
      .find(".header-language-btn-it.header-desktop-language-btn")
      .simulate("click");
    expect(props.setLanguage).toHaveBeenCalledTimes(1);
    wrapper
      .find(".header-language-btn-it.header-mobile-language-btn")
      .simulate("click");
    expect(props.setLanguage).toHaveBeenCalledTimes(2);
  });
  it("should call handleHamburger function when 'hamburger button' is clicked", () => {
    wrapper.find(".header-hamburger").simulate("click");
    expect(wrapper.state().menu).toBe(true);
  });
  it("should call handleHamburger function on Enter key press", () => {
    wrapper.find(".header-hamburger").simulate("keyup", {keyCode: 1});
    expect(wrapper.state().menu).toBe(false);
    wrapper.find(".header-hamburger").simulate("keyup", {keyCode: 13});
    expect(wrapper.state().menu).toBe(true);
  });
});
