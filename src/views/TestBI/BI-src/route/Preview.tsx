import React from 'react';
import { observer, inject } from 'mobx-react';
import { IMainStore } from '../../../../store';
import { Button, AsideNav, Layout, confirm } from 'amis';
import { RouteComponentProps, matchPath } from 'react-router';
import { Link, BrowserRouter, Switch, Route } from 'react-router-dom';
import NotFound from './NotFound';
import AMISRenderer from '../component/AMISRenderer';
import AddPageModal from '../component/AddPageModal';

import { applyPureReactInVue } from 'veaury'

const ReactRoute = applyPureReactInVue(Route)

function isActive(link: any, location: any) {
  const ret = matchPath(location.pathname, {
    path: link ? link.replace(/\?.*$/, '') : '',
    exact: true,
    strict: true
  });

  return !!ret;
}

export default inject('store')(
  observer(function ({
    store,
    location,
    history
  }: { store: IMainStore } & RouteComponentProps): any {
    function renderHeader() {
      return (
        <div>
          <div className={`a-Layout-headerBar`}>
            <div className="hidden-xs p-t-sm pull-right px-2">
              <Button size="sm" className="m-r-xs" level="success" disabled>
                全部导出
              </Button>
              <Button
                size="sm"
                level="info"
                onClick={() => store.setAddPageIsOpen(true)}
              >
                新增页面
              </Button>
            </div>
          </div>
        </div>
      );
    }

    function renderAside() {
      const navigations = store.pages.map(item => ({
        label: item.label,
        path: `/${item.path}`,
        icon: item.icon
      }));
      const paths = navigations.map(item => item.path);

      return (
        <AsideNav
          key={store.asideFolded ? 'folded-aside' : 'aside'}
          navigations={[
            {
              label: '导航',
              children: navigations
            }
          ]}
          renderLink={({ link, toggleExpand, classnames: cx, depth }: any) => {
            if (link.hidden) {
              return null;
            }

            const children = [];

            if (link.children) {
              children.push(
                <span
                  key="expand-toggle"
                  className={cx('AsideNav-itemArrow')}
                  onClick={e => toggleExpand(link, e)}
                ></span>
              );
            }

            link.badge &&
              children.push(
                <b
                  key="badge"
                  className={cx(
                    `AsideNav-itemBadge`,
                    link.badgeClassName || 'bg-info'
                  )}
                >
                  {link.badge}
                </b>
              );

            if (link.icon) {
              children.push(
                <i key="icon" className={cx(`AsideNav-itemIcon`, link.icon)} />
              );
            } else if (store.asideFolded && depth === 1) {
              children.push(
                <i
                  key="icon"
                  className={cx(
                    `AsideNav-itemIcon`,
                    link.children ? 'fa fa-folder' : 'fa fa-info'
                  )}
                />
              );
            }

            link.active ||
              children.push(
                <i
                  key="delete"
                  data-tooltip="删除"
                  data-position="bottom"
                  className={'navbtn fa fa-times'}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    confirm('确认要删除').then(confirmed => {
                      confirmed && store.removePageAt(paths.indexOf(link.path));
                    });
                  }}
                />
              );

            children.push(
              <i
                key="edit"
                data-tooltip="编辑"
                data-position="bottom"
                className={'navbtn fa fa-pencil'}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  history.push(`/edit/${paths.indexOf(link.path)}`);
                }}
              />
            );

            children.push(
              <span key="label" className={cx('AsideNav-itemLabel')}>
                {link.label}
              </span>
            );

            return link.path ? (
              link.active ? (
                <a>{children}</a>
              ) : (
                // @ts-ignore
                <Link to={link.path[0] === '/' ? link.path : `${link.path}`}>
                  {children}
                </Link>
              )
            ) : (
              <a
                onClick={
                  link.onClick
                    ? link.onClick
                    : link.children
                      ? () => toggleExpand(link)
                      : undefined
                }
              >
                {children}
              </a>
            );
          }}
          isActive={(link: any) =>
            isActive(
              link.path && link.path[0] === '/' ? link.path : `${link.path}`,
              location
            )
          }
        />
      );
    }

    function handleConfirm(value: { label: string; icon: string; path: string }) {
      store.addPage({
        ...value,
        schema: {
          type: 'page',
          title: value.label,
          body: '这是你刚刚新增的页面。'
        }
      });
      store.setAddPageIsOpen(false);
    }

    return (
      <Layout
        aside={renderAside()}
        header={renderHeader()}
        folded={store.asideFolded}
        offScreen={store.offScreen}
      >

        {/*  @ts-ignore   */}
        <BrowserRouter>
          {/*  @ts-ignore   */}
          <Switch>
            {store.pages.map(item => (
              //  @ts-ignore
              <Route
                key={item.id}
                path={`/${item.path}`}
                //  @ts-ignore
                render={() => <AMISRenderer schema={item.schema} />}
              />
            ))}

            {/*  @ts-ignore   */}
            <Route component={NotFound} />
            {/*  @ts-ignore   */}
          </Switch>
        </BrowserRouter>



        {/*  @ts-ignore   */}
        {/* <AddPageModal
          show={store.addPageIsOpen}
          onClose={() => store.setAddPageIsOpen(false)}
          onConfirm={handleConfirm}
          pages={store.pages.concat()}
        /> */}




      </Layout>
    );
  })
);

