import React, { Fragment } from 'react';
import cx from 'classnames';

import { connect } from 'react-redux';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import HeaderLogo from '../AppLogo';
import "./styles.scss";
import SearchBox from './Components/SearchBox';
import UserBox from './Components/UserBox';

class Header extends React.Component {
    render() {
        let {
            headerBackgroundColor,
            enableMobileMenuSmall,
            enableHeaderShadow
        } = this.props;
        return (
            <Fragment>
                <ReactCSSTransitionGroup
                    component="div"
                    className={cx("app-header", headerBackgroundColor, { 'header-shadow': enableHeaderShadow })}
                    transitionName="HeaderAnimation"
                    transitionAppear={true}
                    transitionAppearTimeout={1500}
                    transitionEnter={false}
                    transitionLeave={false}>

                    <HeaderLogo/>
                    {/* <div className="ml-3" style={{width:100, height:50, }}>
                        <img style={{width:"100%",height:"100%"}} className="nav-logo" src={require("../../assets/images/medichain.png")} />
                    </div> */}
                    <div className={cx(
                        "app-header__content",
                        { 'header-mobile-open': enableMobileMenuSmall },
                    )}>
                        <div className="app-header-left">
                            <SearchBox />
                        </div>
                        <div className="app-header-right">
                            <UserBox />
                        </div>
                    </div>
                </ReactCSSTransitionGroup>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    enableHeaderShadow: state.ThemeOptions.enableHeaderShadow,
    closedSmallerSidebar: state.ThemeOptions.closedSmallerSidebar,
    headerBackgroundColor: state.ThemeOptions.headerBackgroundColor,
    enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Header);