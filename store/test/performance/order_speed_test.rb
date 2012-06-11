# Copyright (c) 2006 The Pragmatic Programmers, LLC.
# Reproduced from the book "Agile Web Development with Rails, 2nd Ed.",
# published by The Pragmatic Bookshelf.
# Available from www.pragmaticprogrammer.com/titles/rails2
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this source code (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
# 
# 1) This Software cannot be used in any training course or seminar, whether
# presented live, via video, audio, screencast, or any other media, without
# explicit prior permission from the publisher.
# 
# 2) The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE. 

require File.dirname(__FILE__) + '/../test_helper'
require 'store_controller'

# Re-raise errors caught by the controller.
class OrderController; def rescue_action(e) raise e end; end

class OrderSpeedTest < Test::Unit::TestCase
  
  DAVES_DETAILS = {
      :name     => "Dave Thomas",
      :address  => "123 The Street",
      :email    => "dave@pragprog.com",
      :pay_type => "check"
  }
  
  #START:fixtures
  self.fixture_path = File.join(File.dirname(__FILE__), "../fixtures/performance")
  fixtures :products
  #END:fixtures
  
  def setup
    @controller = StoreController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end


  #START:test
  def test_100_orders
    Order.delete_all
    LineItem.delete_all

    #START:silence
    @controller.logger.silence do
    #END:silence
      elapsed_time = Benchmark.realtime do
        100.downto(1) do |prd_id|
          cart = Cart.new
          cart.add_product(Product.find(prd_id))
          post :save_order, 
               { :order => DAVES_DETAILS },
               { :cart  => cart }
          assert_redirected_to :action => :index
        end         
      end       
      assert_equal 100, Order.count
      assert elapsed_time < 3.00
    #START:silence  
    end
    #END:silence
  end
  #END:test
end
