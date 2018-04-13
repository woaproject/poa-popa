import React from 'react';
import * as log from 'loglevel';

import { Loading } from './Loading';

import '../assets/stylesheets/application.css';
import '../assets/javascripts/show-alert.js';

const logger = log.getLogger('ConfirmationPage');

class ConfirmationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            totalAddresses: 0,
            addresses: [],
            wallet: ''
        };
        this.get_total_user_addresses = this.get_total_user_addresses.bind(this);
        this.get_addresses = this.get_addresses.bind(this);
    }

    componentDidMount() {
        logger.debug('MyAddressPage.componentDidMount');

        const [wallet] = this.props.my_web3 && this.props.my_web3.eth.accounts
            ? this.props.my_web3.eth.accounts
            : [];

        this.setState({ wallet })

        if (!wallet) {
            window.show_alert('warning', 'MetaMask account', 'Please unlock your account in MetaMask and refresh the page first');
        }

        this.get_total_user_addresses({wallet}, (err, result) => {
            const totalAddresses = parseInt(result.toFixed())
            this.setState({ totalAddresses })
            let addresses = [];
            for (let i=0; i<this.state.totalAddresses; i++) {
                this.get_addresses({wallet, index: i}, (err, result) => {
                    addresses.push(result);

                  if (addresses.length === totalAddresses) {
                    this.setState({ addresses })
                  }
                })
            }
        })
    }

    get_total_user_addresses(opts, callback) {
        const contract = this.props.contract;

        logger.debug('calling contract.userAddressesCount');
        contract.userAddressesCount(opts.wallet, (err, result) => {
            if (err) {
                logger.debug('Error calling contract.userAddressesCount:', err);
                return callback(err);
            }

            logger.debug('contract.userAddressesCount result =', result.toFixed());
            return callback(null, result);
        });
    }

  get_addresses(opts, callback) {
    const contract = this.props.contract;

    logger.debug('calling contract.userAddress');
    contract.userAddress(opts.wallet, opts.index, (err, result) => {
      if (err) {
        logger.debug('Error calling contract.userAddress:', err);
        return callback(err);
      }

      logger.debug('contract.userAddress result =', result);
      return callback(null, result);
    });
  }

    remove = (e, country, state, city, location, zip) => {
        e.preventDefault();

        const contract = this.props.contract;

        contract.unregisterAddress(country, state, city, location, zip, {
            gas: '1000000'
        }, (err, result) => {
            if (err) {
                logger.debug('Error calling contract.unregisterAddress:', err);
                return;
            }

            window.location.reload();
        });
    }

    render() {
        return (
            <div className='confirmation-page'>
              <section className="content address table">
                  <div className="table-cell table-cell_left">
                    <div className="address-content">
                      <h1 className="title">My Addresses</h1>
                        <ul className="list">
                            {
                                this.state.addresses.map(([country, state, city, location, zip], index) => (
                                  <li key={index}>
                                    Country: <strong>{ country }</strong><br/>
                                    State: <strong>{ state }</strong><br/>
                                    City: <strong>{ city }</strong><br/>
                                    Location: <strong>{ location }</strong><br/>
                                    Zip: <strong>{ zip }</strong><br/>
                                    <a
                                        href=""
                                        onClick={(e) => this.remove(e, country, state, city, location, zip)}
                                    >
                                        (Remove)
                                    </a>
                                  </li>
                                ))
                            }
                        </ul>
                        { this.state.addresses.length === 0 ? (
                          <p className="description">There are no addresses registered for account <b>{this.state.wallet}</b></p>
                        ) : null }
                    </div>
                    </div>
                <div className="table-cell table-cell_rigth">&nbsp;</div>
                </section>
                <Loading show={this.state.loading}/>
            </div>
        );
    }
}

export default ConfirmationPage;
